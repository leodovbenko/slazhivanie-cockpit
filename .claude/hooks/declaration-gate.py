#!/usr/bin/env python3
"""PreToolUse декларация-гейт: коммит с новой способностью не проходит без декларации.

Решение 07.07.2026. Правило CLAUDE.md «декларация способности — часть готовности»
(память capability-declaration-is-part-of-done) держалось на глазу Леонида/халас-ревьюере
постфактум — обратный дрейф (код есть, декларация отстала) машиной не ловился. Этот гейт
переводит дисциплину в механизм, тем же приёмом, что verify-gate: harness дёргает хук на
git commit, Леонида это НЕ трогает — трение падает на агента.

Логика:
  1. ДРЕЙФ ДЕКЛАРАЦИИ (блок). Дифф пахнет новой способностью (коннектор/ingest-рука:
     tenant_connectors, setTenantConnector, новый *-client.ts, handle*Update, verify*Signature),
     но НЕ тронута декларация (upsertAgentTemplate / setCapabilityBindings / новая capability id /
     AGENT_TIER_BREAKDOWN) → deny с инструкцией прогнать скилл agent-capability. Escape для
     ложняка (код не про новую способность / декларация уже в прошлом коммите): агент осознанно
     ставит маркер через decl-mark.sh. Если агент реально добавил декларацию — гейт проходит сам,
     маркер не нужен.
  2. ПРИВАТНОСТЬ (мягкое предупреждение, НЕ блок). Новая выборка по chat_messages с агрегацией
     без user_id → additionalContext-напоминание про фильтр user_id IS NULL (память
     chat-privacy-within-tenant, security-audit-2026-06 #2 — реальная утечка была тут).

Область сигнала намеренно узкая (коннекторы/ingest — самый частый класс «тихих дырок»,
память pachca-connector/read-connector-webhook-ingest), чтобы не блокировать обычные багфиксы.
Хеш changeset берём у verify-gate.py --hash — единый источник, маркер бьётся о тот же дифф.

Честная граница: против «молча забыл под потоком», не против злого обхода.
"""
import sys, json, re, os, subprocess

# ─── helpers (зеркало verify-gate.py, скопированы — verify-gate исполняется при импорте) ───
_PATH = r'(?:"([^"]*)"|\'([^\']*)\'|(\S+))'


def git(repo, *args):
    return subprocess.run(["git", "-C", repo, "--no-pager", *args], capture_output=True)


def _dec(b):
    return b.decode("utf-8", "replace") if isinstance(b, (bytes, bytearray)) else str(b)


def _first(groups):
    return next((g for g in groups if g), "")


def is_git_commit(cmd):
    for seg in re.split(r'[;&|]+|\n', cmd):
        toks = seg.split()
        k = 0
        while k < len(toks) and re.match(r'^\w+=', toks[k]):
            k += 1
        if k >= len(toks) or toks[k] != "git":
            continue
        i = k + 1
        while i < len(toks) and toks[i].startswith("-"):
            opt = toks[i]
            i += 1
            if opt in ("-c", "-C") and i < len(toks):
                i += 1
        if i < len(toks) and toks[i] == "commit":
            return True
    return False


def resolve_repo(cmd):
    repo = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    m = re.search(r'git\s+-C\s+' + _PATH, cmd)
    if m:
        repo = _first(m.groups())
    else:
        cds = re.findall(r'(?:^|[\s;&|])cd\s+' + _PATH, cmd)
        if cds:
            repo = _first(cds[-1])
    return os.path.expanduser(os.path.expandvars(repo))


def marker_dir():
    proj = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    return os.path.join(proj, ".claude", "verify")


def allow():
    sys.exit(0)


def deny(reason):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }}))
    sys.exit(0)


def note(context):
    # мягко: добавить контекст агенту, НЕ трогая решение о разрешении (чтобы не
    # перебить deny соседних хуков вроде verify-gate — permissionDecision не ставим).
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": context,
    }}))
    sys.exit(0)


# ─── сбор диффа: имена файлов + текст добавленных строк (untracked — по содержимому) ───
def touched_and_added(repo):
    top = _dec(git(repo, "rev-parse", "--show-toplevel").stdout).strip()
    if top:
        repo = top
    names = set(_dec(git(repo, "diff", "--name-only", "HEAD").stdout).split())
    others = [p for p in _dec(git(repo, "ls-files", "--others", "--exclude-standard").stdout).split() if p]
    files = names | set(others)

    added = []
    patch = _dec(git(repo, "diff", "--no-color", "HEAD").stdout)
    for ln in patch.splitlines():
        if ln.startswith("+") and not ln.startswith("+++"):
            added.append(ln[1:])
    for p in others:
        if p.endswith(".ts"):
            try:
                with open(os.path.join(repo, p), "r", encoding="utf-8", errors="replace") as f:
                    added.append(f.read())
            except Exception:
                pass
    return files, "\n".join(added)


def diff_hash(repo):
    gate = os.path.join(os.path.dirname(os.path.abspath(__file__)), "verify-gate.py")
    try:
        r = subprocess.run([sys.executable, gate, "--hash", repo], capture_output=True)
        return r.stdout.decode("utf-8", "replace").strip()
    except Exception:
        return ""


# ─── режим --hash: тот же хеш, что у verify-gate (для decl-mark.sh) ───
if len(sys.argv) >= 2 and sys.argv[1] == "--hash":
    repo = os.path.expanduser(sys.argv[2]) if len(sys.argv) >= 3 else (
        os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
    print(diff_hash(repo))
    sys.exit(0)


# ─── сигналы ───
# Новая способность: коннектор/ingest-рука. Узко и высокоточно — не ловит багфиксы.
CODE_SIGNALS = [
    r"tenant_connectors",
    r"setTenantConnector\s*\(",
    r"getTenantConnector\s*\(",
    r"connector_id\s*=\s*['\"]",
    r"function\s+handle\w+Update",   # новый ingest-обработчик (эталон pachca.ts)
    r"verify\w*Signature\s*\(",       # новый вебхук-верификатор
]
# Декларация тронута в этом же диффе.
DECL_SIGNALS = [
    r"upsertAgentTemplate\s*\(",
    r"setCapabilityBindings\s*\(",
    r"AGENT_TIER_BREAKDOWN",
    r"\{\s*id:\s*['\"][\w.]+['\"]\s*,\s*title:",  # новая запись capability
]


def any_match(patterns, text):
    return any(re.search(p, text) for p in patterns)


# ─── основной режим ───
try:
    data = json.load(sys.stdin)
except Exception:
    allow()

cmd = (data.get("tool_input", {}) or {}).get("command", "") or ""
scan = re.sub(r'"[^"]*"', '""', cmd)
scan = re.sub(r"'[^']*'", "''", scan)
if not is_git_commit(scan):
    allow()

repo = resolve_repo(cmd)
try:
    if git(repo, "rev-parse", "HEAD").returncode != 0:
        allow()
    files, added = touched_and_added(repo)
except Exception:
    allow()

# новый *-client.ts (внешний сервис) — тоже сигнал способности
new_client = any(os.path.basename(f).endswith("-client.ts") for f in files)
code_signal = new_client or any_match(CODE_SIGNALS, added)
decl_signal = any_match(DECL_SIGNALS, added)

# приватность: агрегация по chat_messages без user_id (мягкое предупреждение)
privacy_smell = bool(
    re.search(r"chat_messages", added)
    and re.search(r"GROUP\s+BY|COUNT\s*\(|\.all\s*\(", added)
    and not re.search(r"user_id", added)
)
privacy_msg = (
    "⚠️ Приватность: в диффе выборка по chat_messages с агрегацией без user_id. "
    "Проверь фильтр приватности тенанта (user_id IS NULL = командное, личка — отдельно; "
    "память chat-privacy-within-tenant, реальная утечка была в security-audit-2026-06 #2)."
)

if code_signal and not decl_signal:
    h = diff_hash(repo)
    marker = os.path.join(marker_dir(), "decl-" + h + ".ok") if h else None
    if marker and os.path.isfile(marker):
        # ложняк уже осознанно помечен — пропускаем, но приватность всё равно шепнём
        note(privacy_msg) if privacy_smell else allow()
    reason = (
        "📋 Декларация-гейт: дифф добавляет способность (коннектор/ingest-рука), но декларация "
        "не тронута (нет capability/binding/модели). Правило: декларация — часть готовности "
        "(agent-capability). Прогони скилл agent-capability и добавь в ТОМ ЖЕ диффе: capability в "
        "upsertAgentTemplate, binding в setCapabilityBindings (локальный коннектор если внешний "
        "сервис не нужен), модель в AGENT_TIER_BREAKDOWN. Тогда гейт пройдёт сам. "
        "Если это НЕ новая способность (багфикс) или декларация уже в прошлом коммите — осознанно "
        f"поставь маркер: .claude/hooks/decl-mark.sh \"{repo}\""
    )
    if privacy_smell:
        reason += "\n\n" + privacy_msg
    deny(reason)

# способность задекларирована или сигнала нет — только приватность, мягко
if privacy_smell:
    note(privacy_msg)
allow()
