#!/usr/bin/env python3
"""Куда уходят токены сессий — по транскриптам Claude Code, а не на глаз.

Зачем: разбор сжига показал, что интуиция врёт. Байты вывода инструментов (Read 32 МБ
за 3 дня, из них 26 МБ — скриншоты) почти ничего не значат: счёт формируют не прочитанные
файлы, а КОНТЕКСТ × ХОДЫ — каждый ответ модели заново оплачивает всё накопленное.

Печатает четыре среза:
  1. по дням: кэш-чтение (основная масса счёта), кэш-запись, выход, число ходов;
  2. доля кэш-чтения по размеру контекста хода: видно, сколько стоит «распухший хвост».
     Доли считаем по кэш-чтению и так и подписываем: в деньгах токен кэш-записи весит около
     12 токенов чтения, выходной около 50, так что «доля счёта» была бы другой цифрой;
  3. батчинг — сколько вызовов инструментов приходится на ОДИН ответ модели;
  4. базовый контекст сессии (CLAUDE.md + память + схемы инструментов) — он платится
     каждым ходом каждой сессии, поэтому лишний килобайт тут дороже, чем кажется.

ВАЖНО про подсчёт: Claude Code пишет параллельные вызовы одного ответа отдельными
строками с ОДИНАКОВЫМ requestId и продублированным usage. Наивная сумма по строкам
завышает расход в ~1,8 раза — поэтому дедупим по requestId (иначе «оптимизация» будет
мериться против выдуманной базы).

Сессия здесь = один транскрипт, включая транскрипты суб-агентов (они лежат в подпапке
subagents и тоже платят постоянный груз старта каждым своим ходом). В срезе 4 два населения
разделены: у суб-агента контекст свежий, у сессии верхнего уровня он копится часами. Оговорка:
суб-агент, запущенный SDK-сессией, пишет файл верхнего уровня, отличить его нельзя, так что
корзина «верхний уровень» немного разбавлена.

Запуск:  python3 scripts/token-report.py [дней=4]
"""
import json, os, glob, sys, time, collections, statistics

try:
    DAYS = float(sys.argv[1]) if len(sys.argv) > 1 else 4.0
except ValueError:
    sys.exit(__doc__.strip().splitlines()[-1])
BASE = os.path.expanduser("~/.claude/projects")
BUCKETS = ((100_000, "<100к"), (200_000, "100–200к"), (300_000, "200–300к"),
           (400_000, "300–400к"), (float("inf"), "400к+"))


def bucket(ctx):
    for edge, name in BUCKETS:
        if ctx < edge:
            return name
    return BUCKETS[-1][1]


def responses(path):
    """Ответы модели в транскрипте: по одному на requestId (дедуп параллельных вызовов)."""
    seen = set()
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            if '"usage"' not in line and '"tool_use"' not in line:
                continue
            try:
                o = json.loads(line)
            except Exception:
                continue
            msg = o.get("message") or {}
            if msg.get("role") != "assistant":
                continue
            rid = o.get("requestId") or msg.get("id")
            content = msg.get("content")
            tools = (sum(1 for b in content if isinstance(b, dict) and b.get("type") == "tool_use")
                     if isinstance(content, list) else 0)
            u = msg.get("usage") or {}
            key = (path, rid)
            first = key not in seen
            seen.add(key)
            yield {"day": (o.get("timestamp") or "")[:10], "usage": u if first else {},
                   "tools": tools, "rid": rid}


def main():
    cut = time.time() - DAYS * 86400
    cut_day = time.strftime("%Y-%m-%d", time.gmtime(cut))
    # рекурсивно: сессии суб-агентов лежат глубже, <проект>/<сессия>/subagents/agent-*.jsonl.
    # Мерено 04.08: это 18% кэш-чтения и треть всех ходов, одноуровневый glob их терял
    files = [f for f in glob.glob(BASE + "/**/*.jsonl", recursive=True)
             if os.path.getmtime(f) > cut]
    byday = collections.defaultdict(collections.Counter)
    bybucket = collections.Counter()
    tools_per_resp = collections.Counter()
    sessions = []   # (суб-агент?, старт или None, пик, ходов)
    total_cr = tools_total = 0

    for f in files:
        ctxs, per_rid = [], {}
        cut_start = False
        try:
            for r in responses(f):
                # свежий файл может держать и старые ходы (долгая сессия, продолженная
                # через --resume): режем по дню самого хода, иначе окно врёт
                if r["day"] and r["day"] < cut_day:
                    if r["usage"]:
                        cut_start = True   # начало сессии вне окна, «старт» по ней не считаем
                    continue
                if r["tools"]:
                    per_rid[r["rid"]] = per_rid.get(r["rid"], 0) + r["tools"]
                u = r["usage"]
                if not u:
                    continue
                cr = u.get("cache_read_input_tokens", 0)
                ctx = cr + u.get("cache_creation_input_tokens", 0) + u.get("input_tokens", 0)
                if ctx == 0:
                    continue   # строка ошибки API: usage есть, но нулевой, это не ход модели
                d = byday[r["day"]]
                d["кэш-чтение"] += cr
                d["кэш-запись"] += u.get("cache_creation_input_tokens", 0)
                d["выход"] += u.get("output_tokens", 0)
                d["ходов"] += 1
                bybucket[bucket(ctx)] += cr
                total_cr += cr
                ctxs.append(ctx)
        except Exception:
            continue
        for n in per_rid.values():
            tools_per_resp[min(n, 6)] += 1   # в гистограмме верхняя корзина «6+»
            tools_total += n                 # среднее считаем по НЕобрезанным числам
        if len(ctxs) >= 3:
            sub = f"{os.sep}subagents{os.sep}" in f
            sessions.append((sub, None if cut_start else ctxs[0], max(ctxs), len(ctxs)))

    print(f"транскриптов за {DAYS:g} дн.: {len(files)}    сессий (≥3 ходов): {len(sessions)}")
    print("\n== 1. по дням, млн токенов ==")
    print(f"{'день':12}{'кэш-чтение':>12}{'кэш-запись':>12}{'выход':>9}{'ходов':>8}")
    for day in sorted(byday):
        c = byday[day]
        print(f"{day:12}{c['кэш-чтение']/1e6:12.1f}{c['кэш-запись']/1e6:12.1f}"
              f"{c['выход']/1e6:9.2f}{c['ходов']:8d}")

    print("\n== 2. доля кэш-чтения по размеру контекста хода ==")
    heavy = 0
    for _, name in BUCKETS:
        v = bybucket[name]
        share = v / total_cr * 100 if total_cr else 0
        if name in ("200–300к", "300–400к", "400к+"):
            heavy += v
        print(f"{name:10}{v/1e6:9.0f} млн  ({share:5.1f}%)")
    if total_cr:
        print(f"итого: на ходы с контекстом >200к пришлось {heavy/total_cr*100:.0f}% кэш-чтения")

    print("\n== 3. батчинг: вызовов инструментов на один ответ модели ==")
    tot = sum(tools_per_resp.values()) or 1
    for k in sorted(tools_per_resp):
        print(f"  {k}{'+' if k == 6 else ' '}: {tools_per_resp[k]:6d} ({tools_per_resp[k]/tot*100:5.1f}%)")
    avg = tools_total / tot
    print(f"  средне на ход: {avg:.2f}  (1,00 = не батчим совсем)")

    if sessions:
        print("\n== 4. контекст сессии, тыс. токенов ==")
        # два разных населения, вместе они смазывают картину: у суб-агента контекст свежий,
        # у сессии верхнего уровня он копится часами
        for sub, label in ((False, "верхний уровень"), (True, "суб-агенты")):
            rows = [r for r in sessions if r[0] is sub]
            if not rows:
                continue
            firsts = [r[1] for r in rows if r[1] is not None]
            peaks = [r[2] for r in rows]
            turns = [r[3] for r in rows]
            print(f"  {label}, сессий: {len(rows)}")
            if firsts:
                print(f"    старт (постоянный груз, начало в окне у {len(firsts)}): "
                      f"медиана {statistics.median(firsts)/1000:.0f}к, макс {max(firsts)/1000:.0f}к")
            print(f"    пик: медиана {statistics.median(peaks)/1000:.0f}к, "
                  f"макс {max(peaks)/1000:.0f}к")
            print(f"    ходов: медиана {statistics.median(turns):.0f}, макс {max(turns)}")


if __name__ == "__main__":
    main()
