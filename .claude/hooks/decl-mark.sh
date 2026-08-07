#!/usr/bin/env bash
# Escape-маркер для декларация-гейта. Ставит агент ОСОЗНАННО, когда дифф пахнет
# способностью, но новой способности нет (багфикс) ИЛИ декларация уже в прошлом коммите.
# Если способность реальная — не маркер, а декларацию (скилл agent-capability): тогда
# гейт пройдёт сам. Хеш считает declaration-gate.py --hash (тот же, что verify-gate).
# usage: decl-mark.sh [repo_dir]
set -euo pipefail
REPO="${1:-${CLAUDE_PROJECT_DIR:-$PWD}}"
# Нормализуем до корня репозитория — см. verify-mark.sh: из подпапки маркер уезжал мимо гейта.
REPO="$(git -C "$REPO" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$REPO")"
GATE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/declaration-gate.py"
H=$(python3 "$GATE" --hash "$REPO")
[ -n "$H" ] || { echo "decl-mark: пустой хеш (repo=$REPO) — маркер не ставлю" >&2; exit 1; }
# Папка маркера — из РЕПО, а не из $PWD (правится парой с verify-mark.sh).
DIR="${CLAUDE_PROJECT_DIR:-$REPO}/.claude/verify"
mkdir -p "$DIR"
: > "$DIR/decl-$H.ok"
echo "декларация-маркер (ложняк/декларация в прошлом коммите) поставлен: decl-$H (репо: $REPO)"
