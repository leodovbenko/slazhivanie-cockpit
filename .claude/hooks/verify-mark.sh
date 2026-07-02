#!/usr/bin/env bash
# Ставит verify-маркер для changeset репозитория. Вызывает ТОЛЬКО суб-агент
# code-reviewer, когда ревью чистое (нет БЛОКЕРОВ). Хеш считает verify-gate.py --hash —
# единый источник и для хука, и для этого скрипта (учитывает untracked-файлы), чтобы
# не было рассинхрона (раньше скрипт хешировал только `git diff HEAD` и расходился с гейтом).
# usage: verify-mark.sh [repo_dir]
set -euo pipefail
REPO="${1:-${CLAUDE_PROJECT_DIR:-$PWD}}"
GATE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/verify-gate.py"
H=$(python3 "$GATE" --hash "$REPO")
DIR="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/verify"
mkdir -p "$DIR"
: > "$DIR/$H.ok"
echo "verify-маркер поставлен: $H (репо: $REPO)"
