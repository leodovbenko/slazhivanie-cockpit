#!/usr/bin/env bash
# Ставит verify-маркер для changeset репозитория. Вызывает ТОЛЬКО суб-агент
# code-reviewer, когда ревью чистое (нет БЛОКЕРОВ). Хеш считает verify-gate.py --hash —
# единый источник и для хука, и для этого скрипта (учитывает untracked-файлы), чтобы
# не было рассинхрона (раньше скрипт хешировал только `git diff HEAD` и расходился с гейтом).
# usage: verify-mark.sh [repo_dir]
set -euo pipefail
REPO="${1:-${CLAUDE_PROJECT_DIR:-$PWD}}"
# Нормализуем до КОРНЯ репозитория: ревьюер часто стоит в подпапке (.claude/hooks, apps/…),
# и без этого маркер уезжал мимо — 08.08.2026 сел в .claude/hooks/.claude/verify/, гейт его
# не нашёл, коммит встал в вечный deny при формально чистом ревью.
REPO="$(git -C "$REPO" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$REPO")"
GATE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/verify-gate.py"
H=$(python3 "$GATE" --hash "$REPO")
[ -n "$H" ] || { echo "verify-mark: пустой хеш (repo=$REPO) — маркер не ставлю" >&2; exit 1; }
# Папка маркера — из РЕПО, а не из $PWD: гейт ищет в marker_dir() (CLAUDE_PROJECT_DIR) и в
# <repo>/.claude/verify, и оба адреса покрыты. $PWD не обязан быть корнем ни того, ни другого.
DIR="${CLAUDE_PROJECT_DIR:-$REPO}/.claude/verify"
mkdir -p "$DIR"
: > "$DIR/$H.ok"
echo "verify-маркер поставлен: $H (репо: $REPO)"
