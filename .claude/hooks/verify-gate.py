#!/usr/bin/env python3
"""PreToolUse verify-гейт: нетривиальный git commit не проходит без code-reviewer.

Решение 02.07.2026 (сравнение с GSD «Get Shit Done»): verify — не привычка, а гейт.
Перед коммитом нетривиального диффа обязателен прогон суб-агента code-reviewer
(свежий контекст, другой угол). Ревьюер, если чисто, ставит маркер по ХЕШУ диффа
(.claude/verify/<sha1>.ok). Хук пересчитывает хеш на коммите и сверяет:
нет валидного маркера → deny с инструкцией прогнать code-reviewer.

Леонида это НЕ трогает — трение падает на агента, не на человека (у Леонида нет
компетенции ревьюить код; verify = ещё один взгляд суб-агента, а не вопрос ему).
Тривиальные правки (мало строк кода, только доки/STATE) проходят без ревью.

Хеш и подсчёт строк живут в ОДНОМ месте (функция changeset): и хук, и verify-mark.sh
(через `verify-gate.py --hash <repo>`) считают их идентично — рассинхрона нет.
Учитываем и untracked-файлы: `git diff HEAD` их не видит, а коммит новых файлов кода
тоже должен проходить ревью.

Честная граница: гейт против «молча забыл под давлением потока», НЕ против
злонамеренного обхода — маркер технически можно подделать. Инструкция агенту:
verify-маркер ставит ТОЛЬКО code-reviewer (verify-mark.sh), вручную не создаём.
"""
import sys, json, re, os, subprocess, hashlib, time

THRESHOLD = 20  # изменённых строк кода → нетривиально, нужен ревью
CODE_EXT = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py",
            ".html", ".css", ".scss", ".sql", ".sh")
SKIP_NAMES = ("STATE.md",)  # рабочее состояние — не код


def git(repo, *args):
    return subprocess.run(["git", "-C", repo, "--no-pager", *args],
                          capture_output=True)


def is_code(path):
    if os.path.basename(path) in SKIP_NAMES:
        return False
    return path.endswith(CODE_EXT)


def _line_count(content):
    return content.count(b"\n") + (1 if content and not content.endswith(b"\n") else 0)


def changeset(repo):
    """Возвращает (hash_hex, code_lines) для того, что уйдёт в коммит.

    Инвариант к стейджингу: `git add` не меняет ни хеш, ни счёт. Иначе штатный
    `git add x && git commit` ломал бы гейт — новый файл переезжал бы из untracked
    в `git diff HEAD` при том же содержимом и менял хеш. Поэтому НОВЫЕ файлы
    (добавленные vs HEAD ∪ untracked) всегда идут отдельным content-блоком, а патч
    берём только по модификациям/переименованиям/удалениям (--diff-filter=MRCDT).

    Нормализуем к корню репо (rev-parse --show-toplevel): при коммите из подпапки
    `git ls-files --others` иначе скоупится на неё и недосчитает untracked в корне.
    """
    top = git(repo, "rev-parse", "--show-toplevel").stdout.decode("utf-8", "replace").strip()
    if top:
        repo = top

    # патч БЕЗ добавлений (M/R/C/D/T): устойчив к стейджингу
    diff = git(repo, "diff", "--no-color", "HEAD", "--diff-filter=MRCDT").stdout

    code_lines = 0
    ns = git(repo, "diff", "--no-color", "HEAD", "--numstat", "--diff-filter=MRCDT").stdout.decode("utf-8", "replace")
    for line in ns.splitlines():
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        add, dele, path = parts
        if not is_code(path):
            continue
        for v in (add, dele):
            if v.isdigit():
                code_lines += int(v)

    # новые файлы: застейдженные (added vs HEAD) ∪ untracked (не в gitignore)
    added = git(repo, "diff", "--name-only", "HEAD", "--diff-filter=A").stdout.decode("utf-8", "replace").splitlines()
    others = git(repo, "ls-files", "--others", "--exclude-standard").stdout.decode("utf-8", "replace").splitlines()
    new_files = sorted(set(p for p in (added + others) if p.strip()))

    h = hashlib.sha1()
    h.update(diff)
    h.update(b"\n--new--\n")
    for path in new_files:
        try:
            with open(os.path.join(repo, path), "rb") as f:
                content = f.read()
        except Exception:
            content = b""
        h.update(path.encode("utf-8", "replace"))
        h.update(b"\0")
        h.update(content)
        if is_code(path):
            code_lines += _line_count(content)

    return h.hexdigest(), code_lines


_PATH = r'(?:"([^"]*)"|\'([^\']*)\'|(\S+))'  # путь в кавычках (с пробелами!) или без


def _first(groups):
    # ВАЖНО: re.findall для неучаствующих групп чередования даёт '', а не None,
    # поэтому фильтруем по истинности (не `is not None`) — иначе некавыченный
    # путь `cd /x/y && git commit` вернул бы '' и репо потерялось бы.
    return next((g for g in groups if g), "")


def is_git_commit(cmd):
    """git commit в любом сегменте команды, устойчиво к глобальным опциям.

    Ловит `git -c user.name=x commit`, `git -C path commit`, `cd ... && git commit`.
    -c и -C съедают следующий токен. False на `git log ... commit` и т.п.
    Кавычки уже вырезаны вызывающим (упоминание "commit" в сообщении не в счёт).
    """
    for seg in re.split(r'[;&|]+|\n', cmd):
        toks = seg.split()
        k = 0
        while k < len(toks) and re.match(r'^\w+=', toks[k]):
            k += 1  # ведущие присваивания env: FOO=bar git commit
        if k >= len(toks) or toks[k] != "git":
            continue  # git не команда сегмента (echo/grep «git commit» и т.п. — не в счёт)
        i = k + 1
        while i < len(toks) and toks[i].startswith("-"):
            opt = toks[i]
            i += 1
            if opt in ("-c", "-C") and i < len(toks):
                i += 1  # опция с аргументом
        if i < len(toks) and toks[i] == "commit":
            return True
    return False


def resolve_repo(cmd):
    """Целевой репозиторий коммита. Уважает кавычки (путь кокпита — с пробелами!)."""
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


# --- режим --hash: печатает хеш changeset для repo (зовёт verify-mark.sh) ---
if len(sys.argv) >= 2 and sys.argv[1] == "--hash":
    repo = os.path.expanduser(sys.argv[2]) if len(sys.argv) >= 3 else (
        os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
    try:
        h, _ = changeset(repo)
        print(h)
    except Exception:
        sys.exit(1)
    sys.exit(0)


def allow():
    sys.exit(0)


def deny(reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


# --- обычный режим: PreToolUse hook ---
try:
    data = json.load(sys.stdin)
except Exception:
    allow()

cmd = (data.get("tool_input", {}) or {}).get("command", "") or ""

# интересует только git commit; вырезаем содержимое кавычек, чтобы упоминание
# "commit" в тексте сообщения (git commit -m "...commit...") не считалось командой
scan = re.sub(r'"[^"]*"', '""', cmd)
scan = re.sub(r"'[^']*'", "''", scan)
if not is_git_commit(scan):
    allow()

repo = resolve_repo(cmd)

try:
    if git(repo, "rev-parse", "HEAD").returncode != 0:
        allow()  # нет HEAD / не репозиторий — не мешаем
    h, code_lines = changeset(repo)
except Exception:
    allow()

if code_lines <= THRESHOLD:
    allow()  # тривиально / только доки — гейт не нужен

mdir = marker_dir()
marker = os.path.join(mdir, h + ".ok")

# уборка протухших маркеров (>1 суток)
try:
    now = time.time()
    for f in os.listdir(mdir):
        p = os.path.join(mdir, f)
        if os.path.isfile(p) and now - os.path.getmtime(p) > 86400:
            os.remove(p)
except Exception:
    pass

if os.path.isfile(marker):
    allow()

deny(
    f"🔎 Verify-гейт: нетривиальный дифф (~{code_lines} строк кода) не проверен. "
    "Прогони суб-агента code-reviewer по этому диффу (Agent → code-reviewer), "
    f"указав репозиторий: {repo}. Если чисто — он сам поставит verify-маркер, "
    "и коммит пройдёт. Маркер вручную НЕ создавать. Правка после ревью → хеш "
    "меняется → нужен повторный прогон."
)
