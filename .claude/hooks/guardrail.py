#!/usr/bin/env python3
"""PreToolUse guardrail: ТВЁРДО блокирует катастрофические команды.

В отличие от permissions.ask (мягкий вопрос, который легко прокликать вслепую),
этот хук возвращает permissionDecision=deny — команда не выполнится вообще.
Блокируем только необратимое-катастрофическое с минимумом ложных срабатываний;
остальное (reset --hard, обычный rm) оставляем штатному ask/allow.
"""
import sys, json, re

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)  # не смогли распарсить — не мешаем

cmd = (data.get("tool_input", {}) or {}).get("command", "") or ""

# Вырезаем содержимое кавычек: коммит-сообщения, echo, доки часто УПОМИНАЮТ
# опасные слова в кавычках, а реальные катастрофические команды — нет.
# Так убираем ложные срабатывания на `git commit -m "...mkfs..."` и т.п.
scan = re.sub(r'"[^"]*"', '""', cmd)
scan = re.sub(r"'[^']*'", "''", scan)

# (regex, человеческая причина). Регистронезависимо.
RULES = [
    (r'git\s+push\b.*(--force\b|--force-with-lease\b|\s-f\b)',
     "force-push переписывает историю (на main — особенно опасно). Если правда нужно — выполни вручную в терминале."),
    (r'(^|\s|;|&&|\|)\s*dd\s',
     "dd может затереть диск/раздел целиком."),
    (r'\bmkfs(\.\w+)?\b',
     "mkfs форматирует файловую систему."),
    (r'rm\s+(-\w*\s+)*-?\w*[rf]\w*\s+(-\w+\s+)*(/|~|\$HOME|\.git)(\s|$|/)',
     "rm -rf по корню / домашней папке / .git — необратимо."),
    (r':\(\)\s*\{.*\|\s*:',
     "fork-бомба."),
]

for pattern, reason in RULES:
    if re.search(pattern, scan, re.IGNORECASE):
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": f"⛔️ Guardrail: {reason}"
            }
        }))
        sys.exit(0)

sys.exit(0)  # ничего не сmatched — пропускаем дальше
