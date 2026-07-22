#!/usr/bin/env bash
# Codex-совещательный: независимый второй взгляд на дифф (OpenAI Codex, модель gpt-5.6-sol,
# подписка ChatGPT). Решение 23.07.2026 — «вшивай Codex в ревью».
#
# Роли: наш суб-агент code-reviewer — ГЕЙТ (ставит verify-маркер, судит вердикт). Codex —
# СОВЕЩАТЕЛЬНЫЙ (второе мнение). Наш ревьюер зовёт этот скрипт, читает находки Codex и:
#   - отсеивает ложные privacy/security-CRITICAL (Codex клеит их там, где у нас тенант-гейт
#     уже закрывает доступ — это шум, не блокер);
#   - учитывает реальные корректностные/утечковые пропуски, что сам не заметил.
# Codex НИКОГДА не блокирует и НЕ ставит маркер: нет CLI / сбой / пустой вывод → пустой совет,
# гейт работает ровно как раньше. Метод пилота: наш ревьюер решает, Codex подсказывает.
# (codex review неинтерактивен и сам завершается; внешнего timeout не ставим — на macOS его нет.)
#
# Usage: codex-review.sh <repo> [scope...]
#   scope по умолчанию: --uncommitted (staged+unstaged+untracked)
#   для ветки:          --base origin/main
#   для коммита:        --commit <sha>
set -uo pipefail

REPO="${1:?usage: codex-review.sh <repo> [--uncommitted|--base <branch>|--commit <sha>]}"
shift || true
SCOPE=(--uncommitted)
[ "$#" -gt 0 ] && SCOPE=("$@")

# codex не всегда в PATH дефолтной сессии — ищем по известным местам
CODEX="$(command -v codex 2>/dev/null || true)"
if [ -z "$CODEX" ]; then
  for c in "$HOME"/.local/node-*/bin/codex "$HOME/.npm-global/bin/codex" /opt/homebrew/bin/codex; do
    [ -x "$c" ] && { CODEX="$c"; break; }
  done
fi
if [ -z "$CODEX" ]; then
  echo "[codex-review] codex CLI не найден — совещательный ревью пропущен (гейт не затронут)."
  exit 0
fi
# codex — Node-скрипт: ему нужен `node` в PATH. Под-шелл ревьюера PATH ноды не несёт → codex падал бы
# на `env: node: No such file` (exit 127). node лежит в ТОМ ЖЕ bin, что и codex → добавляем этот каталог.
export PATH="$(cd "$(dirname "$CODEX")" && pwd):$PATH"

RAW="$(cd "$REPO" 2>/dev/null && "$CODEX" review "${SCOPE[@]}" 2>&1)"
if [ $? -ne 0 ] || [ -z "$RAW" ]; then
  echo "[codex-review] codex review не дал результата (сбой/таймаут) — совет пропущен (гейт не затронут)."
  exit 0
fi

# Финальная выжимка Codex идёт ПОСЛЕ последней строки-маркера ^codex$ (до неё — reasoning-трейс,
# tsc/npm-шум прогонов). Копим строки ТОЛЬКО после маркера (seen); маркера нет (формат сменился) →
# buf пуст → падаем на tail -60, а НЕ печатаем весь многокилобайтный вывод в контекст ревьюера.
BODY="$(printf '%s\n' "$RAW" | awk '/^codex$/{buf=""; seen=1; next} seen{buf=buf $0 "\n"} END{printf "%s", buf}')"
[ -z "${BODY//[[:space:]]/}" ] && BODY="$(printf '%s\n' "$RAW" | tail -n 60)"

echo "=== Codex (совещательный, gpt-5.6-sol) — второй взгляд, НЕ гейт ==="
printf '%s\n' "$BODY"
echo "=== /Codex. Судишь ТЫ: ложные privacy/security-CRITICAL отсей (тенант-гейт у нас закрывает), реальные пропуски — учти. ==="
