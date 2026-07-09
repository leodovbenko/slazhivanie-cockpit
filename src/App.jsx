import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  LayoutGrid, Plug, ShieldCheck, Route, Brain, Activity, History,
  Satellite, Zap, BarChart3, Mic, Target, Plus, ChevronRight, Menu,
  CircleDot, ArrowRight, Bot, Search, Check, Send, Link2, UserCheck,
} from "lucide-react";

/* ─────────────  TOKENS (светлая тема)  ───────────── */
const c = {
  bg: "#EDF0F6", bg2: "#EBEEF4", panel: "#FFFFFF", panelHi: "#F5F7FB",
  line: "rgba(20,30,50,0.09)", lineHi: "rgba(20,30,50,0.18)",
  txt: "#1B2433", dim: "#5B6677", dim2: "#98A2B3",
  cyan: "#18B9CE", violet: "#7A6CF0", green: "#16B981", amber: "#D9892A", red: "#E5484D", blue: "#4F8DF7",
};
const mono = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace";
const sans = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";
const grad = `linear-gradient(135deg, ${c.cyan}, ${c.violet})`;
const HEALTH = { green: c.green, amber: c.amber, red: c.red };

const SOL = {
  Argus: { icon: Satellite, color: c.violet, sub: "AI Chief of Staff", cat: "Руководителю",
    task: "Тонешь в чатах и встречах — договорённости теряются",
    result: "Брифы, протоколы и находки каждый день. Ничего не теряется.",
    effect: "Больше контроля", speed: "С нашим спецом",
    tags: ["Брифы", "Протоколы", "Память"],
    pitch: "Тихо слушает чаты и встречи и возвращает брифы к встречам, разборы 1:1, протоколы и находки. Растёт по грейдам — от писаря до right-hand уровня совета директоров.",
    landing: {
      situation: "У руководителя десятки чатов, встреч и голосовых в день. Всё важное проговаривается устно и в переписке — и там же тонет.",
      problem: "Договорённости теряются. К встрече готовиться некогда, а протокол после неё пишет тот, у кого дошли руки, — то есть чаще всего никто. Цели незаметно уходят из фокуса.",
      solution: "Аргус тихо слушает чаты и встречи. Возвращает бриф перед встречей, разбор 1:1, протокол сразу участникам и находки: забытые цели, риски, скрытые таланты. Растёт по грейдам — от писаря до правой руки.",
      benefit: "−34% времени руководителя на операционку, 95% задач с владельцем и сроком, ничего не теряется. Меньше ручного контроля — больше видно.",
    } },
  Kairos: { icon: Target, color: "#E879A6", sub: "Дашборд собственника · ТОС", cat: "Руководителю",
    task: "Не видно, какое узкое место тормозит весь бизнес",
    result: "Находит ограничение и ведёт спринт по его снятию.",
    effect: "Больше выручки", speed: "С нашим спецом",
    tags: ["ТОС", "Объекты", "Спринты"],
    pitch: "Управление по объектам, ограничениям и спринтам. Находит главное узкое место бизнеса и ведёт спринт по его снятию. Со встроенным бизнес-коучем." },
  "Сводно": { icon: BarChart3, color: c.green, sub: "Финансовый дашборд", cat: "Финансы и учёт",
    task: "Деньги считаются руками, расхождения всплывают поздно",
    result: "ДДС и дебиторка сходятся каждое утро. Расхождения — сразу.",
    effect: "Больше контроля", speed: "В пару кликов",
    tags: ["ДДС", "Дебиторка", "Консолидация"],
    pitch: "ДДС, консолидация по сети, светофор дебиторки. Сводит факт с управленкой и ловит расхождения каждое утро." },
  Hermes: { icon: Zap, color: c.cyan, sub: "LinkedIn-автопилот", cat: "Маркетинг",
    task: "Нет времени на контент, голос бренда плывёт",
    result: "Посты в твоём голосе по расписанию — без тебя.",
    effect: "Меньше рутины", speed: "В пару кликов",
    tags: ["LinkedIn", "Контент", "Voice"],
    pitch: "Сырая мысль на входе — пост в твоём голосе на выходе, по расписанию. Правила голоса само-обновляются из аналитики.",
    landing: {
      situation: "Ты знаешь, что регулярное присутствие в LinkedIn работает на продажи, найм и репутацию. Но руки не доходят: писать часто, в своём голосе, да ещё и попадать в то, что заходит аудитории.",
      problem: "Контент откладывается неделями. Когда всё же садишься писать — уходит час на один пост, а голос плывёт от настроения. Аналитику никто не смотрит, поэтому охват не растёт.",
      solution: "Кидаешь сырую мысль голосом или текстом в Telegram. Гермес пишет пост в твоём голосе, ты правишь в один тап — и он выходит по расписанию, дважды в будни. Правила голоса подтягивает сам из аналитики прошлых постов.",
      benefit: "Регулярный контент почти без твоего времени: минута на одобрение вместо часа на текст. В демо — 24 500 охвата и до 83 000 показов на топ-пост по MENA, 100% в твоём голосе.",
    } },
  "Маркетинг-лид": { icon: Activity, color: c.cyan, sub: "Тим-лид маркетинга · единый P&L", cat: "Маркетинг",
    task: "Маркетинг размазан по каналам — не видно, что окупается",
    result: "Единый P&L-отчёт воронки и одно решение: куда лить, что гасить.",
    effect: "Больше выручки", speed: "В пару кликов",
    tags: ["P&L", "Воронка", "Оркестрация"],
    pitch: "Сводит весь маркетинг в один P&L — от охвата до сделок и затрат. Цифры принимает из любого источника (счётчик, выгрузка, ввод руками). По кнопке даёт план «что делать дальше»: узкое место и приоритеты — и честно, где данных не хватает. Пока советник (план вам на стол), растёт до управляющего задачами команды.",
    landing: {
      situation: "Маркетинг — это десяток функций сразу: посты, аутрич, SEO, реклама, рассылки. Каждую ведут порознь, а единой картины «сколько вложили и что вернулось» нет ни у кого.",
      problem: "Не видно, какой канал приносит клиентов, а какой просто жжёт бюджет. Данные к тому же лежат вразнобой — у кого-то Яндекс.Метрика или Google Analytics, у кого-то Excel или Power BI, а что-то только в голове. Свести это в одну картину долго и вручную, поэтому решения принимаются на ощущениях.",
      solution: "Маркетинг-лид собирает всё в один отчёт-воронку — от охвата и посещений сайта до заявок, сделок и затрат, с ценой каждого движения. Цифры принимает из любого источника: подключённый счётчик, выгрузка или ввод руками — отчёту неважно, откуда данные, и он честно помечает происхождение каждой. Дальше по кнопке «Что делать дальше?» он смотрит на воронку и вашу цель и выдаёт план: где узкое место, за что взяться в первую очередь — и честно говорит, каких данных ему не хватает.",
      benefit: "Один P&L вместо десяти вкладок и разрозненных таблиц. Видно, откуда приходят клиенты и почём, где узкое место и куда добавить усилие. Пока он советник — план кладёт вам на стол, решаете вы; когда его планы начнут стабильно попадать в цель, он вырастет до управляющего задачами маркетинговой команды.",
    } },
  Recruiter: { icon: UserCheck, color: c.blue, sub: "AI-агент-рекрутер", cat: "Найм и HR", soon: true,
    task: "Сотни откликов на вакансию — прочитать всех невозможно",
    result: "Читает каждое резюме целиком и раскладывает по светофору — рекрутеру остаётся зелёная зона. Полтора часа на вакансию вместо восьми.",
    effect: "Меньше рутины", speed: "С нашим спецом",
    tags: ["hh.ru", "Скрининг", "Светофор"],
    pitch: "Читает полный текст резюме — не только поля — и раскладывает кандидатов по трём зонам светофора с обоснованием и цитатами. Критерии не выдумывает: применяет те, что задал рекрутер под конкретный наём. Одно ядро настраивается под любую вакансию.",
    landing: {
      situation: "Каждый наём — сотни откликов на hh.ru. Рекрутер вручную открывает резюме одно за другим и решает по каждому: смотреть дальше или нет.",
      problem: "Прочитать всех невозможно, поэтому смотрят по верхам и по формальным полям. Сильных кандидатов пропускают, слабых зовут на интервью. Критерии у каждого рекрутера свои, в голове и нигде не записаны.",
      solution: "Агент читает полный текст каждого резюме и раскладывает по трём зонам светофора — с обоснованием и цитатами из резюме. Критерии не придумывает сам: применяет те, что рекрутер задал под конкретный наём.",
      benefit: "Замер HR-эксперта на реальной вакансии: ручной разбор откликов — это рабочий день, около 8 часов (пик доходил до 300 резюме за день — «вручную это ад»). С агентом: прогоняете пачку, дальше рекрутер смотрит только зелёную зону (в примере 8 кандидатов), внимательно и сразу пишет им, попутно берёт жёлтых — итого примерно 1,5 часа вместо 8. Механика простая: агент быстро находит идеальный фит, вы сразу ставите собесы зелёным, а пока ждёте собеседования — разбираете жёлтых. Плюс критерии найма перестают жить в голове рекрутера — их видно и можно править, и один настроенный агент работает на любую вакансию.",
    } },
  "ИИ-хостес": { icon: Mic, color: c.amber, sub: "Приём гостей", cat: "Гостям и продажам",
    task: "Гостям не отвечают вовремя — брони и допродажи теряются",
    result: "Брони и ответы 24/7 в тоне заведения. Плюс допродажи.",
    effect: "Больше выручки", speed: "В пару кликов",
    tags: ["Бронь", "Допродажа", "24/7"],
    pitch: "Принимает брони, отвечает гостям в тоне заведения, делает допродажи и фиксирует всё в системе. Без выходных." },
};
const AGENT_CATS = {
  "Руководителю": c.violet, "Финансы и учёт": c.green, "Маркетинг": c.cyan, "Гостям и продажам": c.amber, "Найм и HR": c.blue,
};
const EFFECT_COL = { "Больше выручки": c.green, "Меньше рутины": c.cyan, "Больше контроля": c.violet };
const SPEED_COL = { "В пару кликов": c.green, "С нашим спецом": c.amber };
const DIMS = {
  role:   { label: "по отделу",   key: "cat",    values: ["Руководителю", "Финансы и учёт", "Маркетинг", "Гостям и продажам", "Найм и HR"] },
  effect: { label: "по эффекту",  key: "effect", values: ["Больше выручки", "Меньше рутины", "Больше контроля"] },
  speed:  { label: "по скорости", key: "speed",  values: ["В пару кликов", "С нашим спецом"] },
};
const dimColor = (dim, v) => dim === "role" ? AGENT_CATS[v] : dim === "effect" ? EFFECT_COL[v] : SPEED_COL[v];
const CATS = {
  "Интеграции": c.cyan, "Учёт и ЭДО": c.violet, "Госучёт": c.amber,
  "Лояльность": c.green, "Аналитика": c.blue, "Коммуникации": "#E879A6", "Контроль": c.red,
};

const clients = [
  { id: "c1", name: "Холдинг «Вкус»", seg: "HoReCa · 4 точки" },
  { id: "c2", name: "ГК «Открытый Сервис»", seg: "Киоски · сеть" },
  { id: "c3", name: "Бар «Шалфей»", seg: "Бар · 1 точка" },
  { id: "c4", name: "Сеть «Рецептика»", seg: "Рестораны · 9 точек" },
  { id: "c5", name: "Кофейни «Дрип»", seg: "Кофе · 6 точек" },
];
const cName = (id) => clients.find((x) => x.id === id)?.name || id;

const GRADES = [
  { g: 0, t: "Стажёр · Писарь", d: "тихо ловит и хранит всё" },
  { g: 1, t: "Джуниор · Аналитик-исполнитель", d: "брифы, разборы 1:1, сводка дня" },
  { g: 2, t: "Мидл · Память и хвосты", d: "ведёт договорённости, follow-up" },
  { g: 3, t: "Сеньор · Портфельное мышление", d: "проактивен, ловит дрейф от целей" },
  { g: 4, t: "Топ · Chief of Staff уровня СД", d: "держит повестку компании" },
];

const initConnectors = [
  { id: "tg", name: "Telegram", status: "active", clients: 5, agents: 7 },
  { id: "wa", name: "WhatsApp", status: "active", clients: 2, agents: 2 },
  { id: "no", name: "Notion", status: "active", clients: 2, agents: 3 },
  { id: "bd", name: "Buildin", status: "beta", clients: 1, agents: 1 },
  { id: "1c", name: "1С", status: "active", clients: 4, agents: 5 },
  { id: "ik", name: "iiko", status: "active", clients: 3, agents: 4 },
  { id: "am", name: "amoCRM", status: "active", clients: 2, agents: 2 },
  { id: "gm", name: "Gmail", status: "active", clients: 3, agents: 3 },
  { id: "mg", name: "Mango Office", status: "active", clients: 2, agents: 2 },
  { id: "rp", name: "Restoplace", status: "beta", clients: 1, agents: 1 },
];
const models = [
  { id: "opus", name: "Claude Opus 4.x", routes: "брифы · длинные документы · разбор", rank: 1 },
  { id: "giga", name: "GigaChat", routes: "массовые ответы · дешёвый объём", rank: 2 },
  { id: "yagpt", name: "YandexGPT", routes: "резерв · локальный контур", rank: 3 },
];
const spark = (n, up) => Array.from({ length: 8 }, (_, i) => ({ v: 0.6 + (up ? i : (n - i)) * 0.03 + Math.sin(i + n) * 0.02 }));

const agents = [
  { id: "a1", sol: "ИИ-хостес", client: "c1", level: "2–3", health: "red", note: "ответы вне тона · 0.58 ↓", model: "giga",
    uses: ["connectors", "model", "memory", "evals"], conns: ["tg", "ik", "mg"], evals: [{ n: "on-brand тон", s: 0.58, tr: spark(2, 0) }],
    activity: [["13:02", "ответ гостю отправлен", "GigaChat"], ["12:50", "бронь подтверждена", "GigaChat"], ["12:31", "флаг: ответ вне тона", "—"]],
    deposited: [{ a: "коннектор iiko", tag: "platform", type: "runtime" }, { a: "скрипт приёма брони", tag: "platform", type: "template" }, { a: "тон-промпт под бар", tag: "glue", type: "—" }], share: 0.5 },
  { id: "a2", sol: "Argus", client: "c2", grade: 1, health: "amber", note: "качество брифов 0.71 ↓", model: "opus",
    uses: ["connectors", "model", "proxy", "memory", "evals"], conns: ["tg", "no", "gm"], evals: [{ n: "качество брифов", s: 0.71, tr: spark(3, 0) }],
    activity: [["13:01", "сводка дня собрана", "Claude Opus"], ["11:40", "бриф к встрече готов", "Claude Opus"]],
    deposited: [{ a: "коннектор Notion", tag: "platform", type: "runtime" }, { a: "промпт-скелет брифа", tag: "platform", type: "template" }, { a: "методика разбора 1:1", tag: "platform", type: "template" }, { a: "клей под учётку клиента", tag: "glue", type: "—" }], share: 0.55 },
  { id: "a3", sol: "Kairos", client: "c4", level: "3–4", health: "amber", note: "ограничение не снято 2-й спринт", model: "opus",
    uses: ["connectors", "model", "memory", "evals"], conns: ["1c", "ik"], evals: [{ n: "снятие ограничений", s: 0.79, tr: spark(4, 1) }],
    activity: [["12:55", "узкое место: кухня", "Claude Opus"], ["09:10", "приоритеты спринта пересчитаны", "Claude Opus"]],
    deposited: [{ a: "коннектор 1С", tag: "platform", type: "runtime" }, { a: "модель объектов управления", tag: "platform", type: "template" }, { a: "клей под склад клиента", tag: "glue", type: "—" }], share: 0.61 },
  { id: "a4", sol: "Argus", client: "c1", grade: 2, health: "green", model: "opus",
    uses: ["connectors", "model", "proxy", "memory", "evals"], conns: ["tg", "no", "gm", "1c"], evals: [{ n: "качество брифов", s: 0.91, tr: spark(5, 1) }],
    activity: [["13:02", "протокол встречи в чат", "Claude Opus"], ["12:10", "хвост подсвечен: КП не отправлено", "Claude Opus"], ["09:00", "бриф к 4 встречам дня", "Claude Opus"]],
    deposited: [{ a: "лестница грейдов", tag: "platform", type: "template" }, { a: "коннектор Gmail", tag: "platform", type: "runtime" }, { a: "клей под оргструктуру", tag: "glue", type: "—" }], share: 0.66 },
  { id: "a5", sol: "Hermes", client: "c1", level: "2–3", health: "green", model: "opus",
    uses: ["connectors", "model", "evals"], conns: ["tg"], evals: [{ n: "on-brand score", s: 0.88, tr: spark(6, 1) }],
    activity: [["13:02", "пост опубликован", "Claude Opus"], ["13:01", "черновик одобрен · 1 тап", "—"], ["09:00", "идея из канала захвачена", "—"]],
    deposited: [{ a: "движок voice-rules", tag: "platform", type: "template" }, { a: "клей под TG-канал", tag: "glue", type: "—" }], share: 0.72 },
  { id: "a6", sol: "Сводно", client: "c1", level: "0–1", health: "green", model: "opus",
    uses: ["connectors", "model", "memory"], conns: ["1c", "ik", "am"], evals: [{ n: "сходимость с фактом", s: 0.95, tr: spark(6, 1) }],
    activity: [["08:00", "ДДС за вчера сведён", "Claude Opus"], ["08:00", "светофор дебиторки обновлён", "—"]],
    deposited: [{ a: "коннектор iiko", tag: "platform", type: "runtime" }, { a: "GPT-правила учёта", tag: "platform", type: "template" }, { a: "клей под план счетов", tag: "glue", type: "—" }], share: 0.78 },
  { id: "a7", sol: "Сводно", client: "c2", level: "0–1", health: "green", model: "opus",
    uses: ["connectors", "model", "memory"], conns: ["1c", "am"], evals: [{ n: "сходимость с фактом", s: 0.93, tr: spark(5, 1) }],
    activity: [["08:02", "консолидация интеркомпани", "Claude Opus"]],
    deposited: [{ a: "GPT-правила учёта", tag: "platform", type: "template" }, { a: "клей под холдинг", tag: "glue", type: "—" }], share: 0.74 },
  { id: "a8", sol: "Сводно", client: "c4", level: "0–1", health: "amber", note: "расхождение управленки 11%", model: "opus",
    uses: ["connectors", "model", "memory"], conns: ["1c", "ik"], evals: [{ n: "сходимость с фактом", s: 0.82, tr: spark(3, 0) }],
    activity: [["08:05", "флаг: расхождение факт/управленка", "Claude Opus"]],
    deposited: [{ a: "коннектор iiko", tag: "platform", type: "runtime" }, { a: "клей под сеть", tag: "glue", type: "—" }], share: 0.69 },
  { id: "a9", sol: "ИИ-хостес", client: "c3", level: "2–3", health: "green", model: "giga",
    uses: ["connectors", "model", "evals"], conns: ["tg", "rp", "mg"], evals: [{ n: "on-brand тон", s: 0.9, tr: spark(6, 1) }],
    activity: [["13:00", "бронь на 19:00 подтверждена", "GigaChat"], ["12:30", "допродажа: депозит", "GigaChat"]],
    deposited: [{ a: "коннектор Restoplace", tag: "platform", type: "runtime" }, { a: "скрипт приёма брони", tag: "platform", type: "template" }, { a: "клей под меню", tag: "glue", type: "—" }], share: 0.71 },
  { id: "a10", sol: "Kairos", client: "c2", level: "3–4", health: "green", model: "opus",
    uses: ["connectors", "model", "memory", "evals"], conns: ["1c"], evals: [{ n: "снятие ограничений", s: 0.89, tr: spark(6, 1) }],
    activity: [["12:40", "ограничение: логистика", "Claude Opus"]],
    deposited: [{ a: "модель объектов управления", tag: "platform", type: "template" }, { a: "клей под маршруты", tag: "glue", type: "—" }], share: 0.77 },
  { id: "a11", sol: "Hermes", client: "c5", level: "2–3", health: "green", model: "opus",
    uses: ["connectors", "model", "evals"], conns: ["tg"], evals: [{ n: "on-brand score", s: 0.86, tr: spark(6, 1) }],
    activity: [["13:02", "пост в очереди", "Claude Opus"]],
    deposited: [{ a: "движок voice-rules", tag: "platform", type: "template" }, { a: "клей под канал", tag: "glue", type: "—" }], share: 0.75 },
];

const memory = {
  c1: { people: [["Сергей Л.", "операционный директор", "сегодня"], ["Анна К.", "шеф-повар", "вчера"], ["Игорь П.", "управляющий Тверская", "2 дня назад"]], companies: [["ООО «Поставка-Юг»", "поставщик"], ["ИП Орлов", "подрядчик"]], okrs: [["Маржа сети +4 п.п.", "62%"], ["Запуск 5-й точки", "30%"]], meetings: 180, messages: 12400 },
  c2: { people: [["Мария В.", "CFO", "сегодня"], ["Дмитрий С.", "глава закупок", "вчера"]], companies: [["ГК «МеталлТара»", "поставщик"]], okrs: [["Снизить простой киосков", "44%"]], meetings: 96, messages: 8200 },
  c3: { people: [["Олег Ш.", "владелец", "сегодня"]], companies: [["Restoplace", "бронирование"]], okrs: [["Загрузка будни +15%", "51%"]], meetings: 22, messages: 1900 },
  c4: { people: [["Елена Р.", "управляющая сетью", "сегодня"]], companies: [["ЕГАИС", "данные"]], okrs: [["Сходимость учёта 98%", "82%"]], meetings: 64, messages: 5100 },
  c5: { people: [["Павел Д.", "основатель", "вчера"]], companies: [], okrs: [["Узнаваемость бренда", "38%"]], meetings: 18, messages: 1400 },
};
const deployments = [
  { seq: 1, client: "c3", share: 0.5 }, { seq: 2, client: "c1", share: 0.55 }, { seq: 3, client: "c2", share: 0.61 },
  { seq: 4, client: "c4", share: 0.66 }, { seq: 5, client: "c5", share: 0.72 }, { seq: 6, client: "c1", share: 0.78 },
];
const libraryGrowth = [
  { seq: 1, runtime: 4, template: 3 }, { seq: 2, runtime: 6, template: 6 }, { seq: 3, runtime: 9, template: 10 },
  { seq: 4, runtime: 12, template: 15 }, { seq: 5, runtime: 14, template: 21 }, { seq: 6, runtime: 16, template: 27 },
];
const libAssets = [
  ["GPT-правила учёта", "Сводно @ Вкус", "template", 3], ["коннектор iiko", "ИИ-хостес @ Вкус", "runtime", 4],
  ["промпт-скелет брифа", "Argus @ Открытый Сервис", "template", 2], ["движок voice-rules", "Hermes @ Вкус", "template", 2],
  ["модель объектов управления", "Kairos @ Открытый Сервис", "template", 2], ["прокси-набор ПДн", "платформа", "runtime", 5],
];
const CATALOG = [
  ["Связывание iiko ↔ 1С", "Интеграции", "Авто-выгрузка продаж, остатков и документов без ручного переноса."],
  ["Сверка DocsInBox ↔ накладные", "Учёт и ЭДО", "Авто-сверка входящих накладных с поставками, подсветка расхождений."],
  ["ЕГАИС: контроль расхождений", "Госучёт", "Мониторинг остатков и расхождений, задачи на разбор до блокировки."],
  ["Меркурий: авто-гашение ВСД", "Госучёт", "Ветеринарные документы гасятся автоматически по приёмке."],
  ["Честный знак: маркировка", "Госучёт", "Проверка кодов маркировки на приёмке и продаже."],
  ["Синхронизация лояльности", "Лояльность", "Premium Bonus / MindBox связаны с iiko в реальном времени."],
  ["Утренняя сводка по сети", "Аналитика", "Каждое утро в Telegram: выручка, чек, узкие места по точкам."],
  ["Триггер негатива из отзывов", "Коммуникации", "Всплеск негатива по точке → задача управляющему."],
  ["Summary звонков с триггерами", "Коммуникации", "Автоподсветка проблемных разговоров из тысяч минут записей."],
  ["Раннее предупреждение об оттоке", "Аналитика", "Агент по комбо-сигналам сам ставит задачу ответственному."],
  ["Авто-задачи из событий", "Контроль", "Клиент обратился, но не оформлен → задача менеджеру."],
  ["AI-штаб в Telegram", "Коммуникации", "Память по людям, задачам и договорённостям; брифы к встречам."],
  ["Досье клиента за минуту", "Аналитика", "Вся история обращений, договорённостей и проблем по запросу."],
  ["Контроль фудкоста", "Контроль", "Алерты при росте себестоимости блюд выше нормы."],
  ["Банк-клиент: разнесение", "Учёт и ЭДО", "Платежи автоматически разносятся по точкам и статьям."],
  ["Воронка доставки", "Аналитика", "Брошенные заказы и отказы на оплате — в моменте."],
  ["Контроль простоев точек", "Контроль", "Простой кухни и нехватка персонала в пик."],
  ["Прогноз выручки по точкам", "Аналитика", "Прогноз на неделю по каждой точке и бренду."],
  ["Авто-ответы гостям (бронь)", "Коммуникации", "AI-хостес бронирует, двигает столы, просит предоплату."],
  ["Контроль акций и скидок", "Контроль", "Подсветка злоупотреблений скидками по сотрудникам."],
  ["KPI управляющих", "Аналитика", "Рейтинг точек и управляющих по ключевым метрикам."],
  ["Сводка жалоб из всех каналов", "Коммуникации", "Отзывы, чаты, звонки — в одном дайджесте."],
  ["Авто-инвентаризация", "Контроль", "Расхождения факт/учёт по итогам инвентаризации."],
  ["Бриф к встрече", "Коммуникации", "AI готовит бриф по партнёру/точке за минуту."],
  ["Память по договорённостям", "Коммуникации", "Ничего не теряется: кто, что и когда обещал."],
  ["СБИС / Контур: ЭДО", "Учёт и ЭДО", "Электронный документооборот связан с учётом."],
  ["Контроль списаний", "Контроль", "Алерты по аномальным списаниям и порче."],
  ["GetMeBack / GetWallet", "Лояльность", "Кошельки и возвратные механики связаны с кассой."],
  ["Тайный гость: авто-чеклисты", "Контроль", "Чеклисты сервиса и авто-сбор результатов по точкам."],
  ["Контроль возвратов и отмен", "Контроль", "Аномалии по возвратам и отменам чеков."],
  ["Меню-инжиниринг", "Аналитика", "Матрица «звёзды / лошадки / аутсайдеры» по марже и популярности."],
  ["Автозаказ и прогноз закупок", "Контроль", "Прогноз расхода и черновик заказа поставщику по каждой точке."],
  ["Кастом под вашу сеть", "Интеграции", "Всё, что не закрывает текущий софт — собираем индивидуально."],
];

/* ─────────────  PRIMITIVES  ───────────── */
const Eyebrow = ({ children, style }) => (
  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: c.dim2, fontWeight: 700, ...style }}>{children}</div>
);
const Card = ({ children, style, onClick, hover }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 14, padding: 16, transition: "all .15s",
        cursor: onClick ? "pointer" : "default",
        boxShadow: h && hover ? "0 8px 24px rgba(20,30,50,0.10)" : "0 1px 2px rgba(20,30,50,0.04), 0 2px 8px rgba(20,30,50,0.04)",
        transform: h && hover ? "translateY(-2px)" : "none", ...style }}>{children}</div>
  );
};
const HealthDot = ({ s, size = 9 }) => (
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: 99, background: HEALTH[s], boxShadow: `0 0 8px ${HEALTH[s]}66` }} />
);
const Badge = ({ children, color = c.dim, bg }) => (
  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: .3, color, background: bg || "rgba(20,30,50,0.045)", padding: "2px 8px", borderRadius: 6, border: `1px solid ${c.line}` }}>{children}</span>
);
const SUBS = ["connectors", "model", "proxy", "memory", "evals"];
const Footing = ({ uses }) => (
  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
    {SUBS.map((s) => <div key={s} title={s} style={{ width: 18, height: 4, borderRadius: 2, background: uses.includes(s) ? grad : "rgba(20,30,50,0.10)" }} />)}
  </div>
);

/* ─────────────  CATALOG (Флот агентов)  ───────────── */
function Catalog({ onOpenSol }) {
  const [cat, setCat] = useState("Все");
  const [q, setQ] = useState("");
  const [conn, setConn] = useState({});
  const [dim, setDim] = useState("role");
  const [pick, setPick] = useState("Все");
  const [sort, setSort] = useState("cat");
  const items = CATALOG
    .filter(([t, k, d]) => (cat === "Все" || k === cat) && (t.toLowerCase().includes(q.toLowerCase()) || d.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => sort === "name" ? a[0].localeCompare(b[0], "ru") : (a[1].localeCompare(b[1], "ru") || a[0].localeCompare(b[0], "ru")));
  const flag = ["Argus", "Kairos", "Сводно", "Hermes", "Маркетинг-лид", "ИИ-хостес", "Recruiter"].filter((s) => pick === "Все" || SOL[s][DIMS[dim].key] === pick);
  return (
    <div>
      <Eyebrow>обзор · задачи бизнеса</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Флот агентов</h1>
      <p style={{ color: c.dim, marginBottom: 16, maxWidth: 700 }}>Не лента ботов, а навигация по задачам бизнеса. Выбери срез — отдел, эффект или скорость внедрения — и увидишь, какую задачу агент закрывает и какой даёт результат.</p>

      <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 11, flexWrap: "wrap" }}>
        <Eyebrow style={{ marginRight: 4 }}>смотреть</Eyebrow>
        {Object.entries(DIMS).map(([k, v]) => {
          const on = dim === k;
          return <button key={k} onClick={() => { setDim(k); setPick("Все"); }} style={{ background: on ? "rgba(20,30,50,0.06)" : "transparent", color: on ? c.txt : c.dim, border: `1px solid ${on ? c.lineHi : c.line}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{v.label}</button>;
        })}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        {["Все", ...DIMS[dim].values].map((k) => {
          const on = pick === k, col = k === "Все" ? c.dim : dimColor(dim, k);
          return <button key={k} onClick={() => setPick(k)} style={{ background: on ? (k === "Все" ? "rgba(20,30,50,0.06)" : `${col}14`) : "transparent", color: on ? c.txt : c.dim, border: `1px solid ${on && k !== "Все" ? col : c.line}`, borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{k}</button>;
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 12, marginBottom: 26 }}>
        {flag.map((s) => {
          const S = SOL[s], I = S.icon, col = S.color, n = agents.filter((x) => x.sol === s).length;
          return (
            <Card key={s} hover onClick={() => onOpenSol(s)} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${col}26, ${col}0d)`, border: `1px solid ${col}40`, flexShrink: 0 }}><I size={17} color={col} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: c.dim2, textTransform: "uppercase", letterSpacing: ".05em" }}>для кого · {S.cat}</div>
                  <div style={{ fontSize: 12, color: c.dim, fontWeight: 600 }}>{s} · {S.sub}</div>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 9 }}>{S.task}</div>
              <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 12, flex: 1 }}>
                <ArrowRight size={15} color={col} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 12.5, color: c.txt, lineHeight: 1.4 }}>{S.result}</div>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                <Badge color={EFFECT_COL[S.effect]} bg={`${EFFECT_COL[S.effect]}12`}>{S.effect}</Badge>
                <Badge color={SPEED_COL[S.speed]} bg={`${SPEED_COL[S.speed]}12`}>{S.speed}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${c.line}`, paddingTop: 10 }}>
                <span style={{ fontSize: 11.5, color: c.dim2 }}>{S.soon ? "скоро в кокпите" : `развёрнут · ${n} внедрений`}</span>
                <span style={{ fontSize: 12.5, color: col, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>Смотреть <ChevronRight size={14} /></span>
              </div>
            </Card>
          );
        })}
      </div>

      <Eyebrow style={{ marginBottom: 10 }}>модули · подключаются по отдельности</Eyebrow>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: "8px 12px", flex: "1 1 220px", maxWidth: 320 }}>
          <Search size={15} color={c.dim2} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="поиск модуля…" style={{ border: "none", outline: "none", background: "transparent", color: c.txt, fontSize: 13.5, width: "100%" }} />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: c.panel, color: c.txt, border: `1px solid ${c.line}`, borderRadius: 10, padding: "9px 10px", fontSize: 12.5, outline: "none", cursor: "pointer" }}>
          <option value="cat">сортировка: по категории</option>
          <option value="name">сортировка: по названию</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {["Все", ...Object.keys(CATS)].map((k) => {
          const on = cat === k, col = CATS[k] || c.dim;
          return <button key={k} onClick={() => setCat(k)} style={{ background: on ? (k === "Все" ? "rgba(20,30,50,0.06)" : `${col}14`) : "transparent", color: on ? c.txt : c.dim, border: `1px solid ${on && k !== "Все" ? col : c.line}`, borderRadius: 99, padding: "6px 13px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{k}</button>;
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {items.map(([t, k, d], i) => {
          const col = CATS[k], done = conn[t];
          return (
            <Card key={i} style={{ padding: 0, overflow: "hidden", display: "flex" }}>
              <div style={{ width: 4, background: col, flexShrink: 0 }} />
              <div style={{ padding: 14, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <Badge color={col} bg={`${col}12`}>{k}</Badge>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: c.dim, lineHeight: 1.45, marginBottom: 12, minHeight: 36 }}>{d}</div>
                <button onClick={() => setConn({ ...conn, [t]: !done })}
                  style={{ display: "flex", gap: 6, alignItems: "center", width: "100%", justifyContent: "center",
                    background: done ? `${c.green}14` : c.panelHi, color: done ? c.green : c.txt,
                    border: `1px solid ${done ? c.green : c.line}`, borderRadius: 8, padding: "8px 0", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                  {done ? <><Check size={14} /> Подключено</> : "Подключить"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: c.dim2 }}>Каталог · {CATALOG.length} модулей · демо на базе Open Service</div>
    </div>
  );
}

/* ─────────────  MY AGENTS (подключённые)  ───────────── */
function MyAgents({ filter, onOpen }) {
  const list = useMemo(() => {
    const order = { red: 0, amber: 1, green: 2 };
    return agents.filter((a) => filter === "all" || a.client === filter).sort((x, y) => order[x.health] - order[y.health]);
  }, [filter]);
  const tiles = [
    ["клиентов live", clients.length], ["агентов подключено", agents.length],
    ["здоровы", agents.filter((a) => a.health === "green").length, c.green],
    ["деградируют", agents.filter((a) => a.health !== "green").length, c.red],
    ["активов в платформе", 43, c.cyan], ["средняя доля → платформа", "64%", c.violet],
  ];
  return (
    <div>
      <Eyebrow>обзор · мои агенты</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Подключённые агенты</h1>
      <p style={{ color: c.dim, marginBottom: 20, maxWidth: 640 }}>Развёрнуты у клиентов — отслеживаем здоровье из одного окна. Красные всплывают наверх.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {tiles.map(([l, v, col], i) => (
          <Card key={i} style={{ padding: 14 }}>
            <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: col || c.txt }}>{v}</div>
            <div style={{ fontSize: 12, color: c.dim, marginTop: 2 }}>{l}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {list.map((a) => {
          const I = SOL[a.sol].icon, col = SOL[a.sol].color;
          return (
            <Card key={a.id} hover onClick={() => onOpen(a.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", background: `${col}1a`, border: `1px solid ${col}40` }}><I size={18} color={col} /></div>
                  <div><div style={{ fontWeight: 600 }}>{a.sol}</div><div style={{ fontSize: 12, color: c.dim }}>{cName(a.client)}</div></div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}><HealthDot s={a.health} /><Badge color={col}>{a.grade != null ? `G${a.grade}` : a.level}</Badge></div>
              </div>
              {a.note && <div style={{ fontSize: 12, color: HEALTH[a.health], marginTop: 10 }}>{a.note}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                <Footing uses={a.uses} />
                <div style={{ fontSize: 11, color: c.dim2 }}>{a.conns.length} конн · {models.find((m) => m.id === a.model)?.name.split(" ")[0]}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────  PLATFORM PANELS  ───────────── */
function Connectors() {
  const [list, setList] = useState(initConnectors);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const add = () => { if (!name.trim()) return; setList([{ id: name, name: name.trim(), status: "beta", clients: 0, agents: 0, fresh: true }, ...list]); setName(""); setAdding(false); };
  return (
    <div>
      <Eyebrow>платформа · слой A</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Коннекторы</h1>
      <p style={{ color: c.dim, marginBottom: 18, maxWidth: 640 }}>Каждый коннектор собирается один раз и переиспользуется всеми будущими внедрениями. Сейчас в каталоге: <b style={{ color: c.txt, fontFamily: mono }}>{list.length}</b>.</p>
      <button onClick={() => setAdding(true)} style={{ display: "flex", gap: 8, alignItems: "center", background: grad, color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontWeight: 700, cursor: "pointer", marginBottom: 16 }}><Plus size={16} /> Добавить коннектор</button>
      {adding && (
        <Card style={{ marginBottom: 16, maxWidth: 460 }}>
          <Eyebrow style={{ marginBottom: 8 }}>новый коннектор</Eyebrow>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="например, Outlook" style={{ width: "100%", background: c.panelHi, border: `1px solid ${c.lineHi}`, color: c.txt, borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={add} style={{ background: c.cyan, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>В каталог</button>
            <button onClick={() => setAdding(false)} style={{ background: "transparent", color: c.dim, border: `1px solid ${c.line}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>Отмена</button>
          </div>
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
        {list.map((k) => (
          <Card key={k.id} style={{ outline: k.fresh ? `1px solid ${c.cyan}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Plug size={16} color={c.cyan} /><span style={{ fontWeight: 600 }}>{k.name}</span></div>
              <Badge color={k.status === "active" ? c.green : c.amber}>{k.status}</Badge>
            </div>
            <Badge color={c.cyan} bg={`${c.cyan}12`}>рантайм-актив</Badge>
            <div style={{ fontSize: 12, color: c.dim, marginTop: 10 }}>{k.fresh ? "доступен всем будущим внедрениям" : `${k.clients} клиентов · ${k.agents} агентов`}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const PARTS = [
  { t: "Позвони " }, { t: "Ивану Петрову", type: "person", tok: "[PERSON_1]" }, { t: " (" }, { t: "+7 921 445-10-22", type: "phone", tok: "[PHONE_1]" }, { t: "), " },
  { t: "ИНН 7707083893", type: "inn", tok: "[INN_1]" }, { t: ", по сделке с " }, { t: "ООО «Ромашка»", type: "org", tok: "[ORG_1]" }, { t: ". Бюджет до " }, { t: "2 400 000 ₽", type: "money", tok: "[AMOUNT_1]" }, { t: "." },
];
const ENTITIES = [["person", "имена"], ["phone", "телефоны"], ["inn", "ИНН"], ["org", "компании"], ["money", "суммы"]];
function Proxy() {
  const [on, setOn] = useState({ person: true, phone: true, inn: true, org: true, money: true });
  return (
    <div>
      <Eyebrow>платформа · слой A</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Прокси приватности</h1>
      <p style={{ color: c.dim, marginBottom: 18, maxWidth: 660 }}>ПДн заменяются на токены до того, как промпт уйдёт в модель. Маппинг хранится у клиента — не у провайдера. Это то, что сами агенты дать не могут.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {ENTITIES.map(([k, l]) => <button key={k} onClick={() => setOn({ ...on, [k]: !on[k] })} style={{ background: on[k] ? `${c.violet}14` : "transparent", color: on[k] ? c.violet : c.dim, border: `1px solid ${on[k] ? c.violet : c.line}`, borderRadius: 99, padding: "6px 13px", fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>{l}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "stretch" }}>
        <Card>
          <Eyebrow style={{ marginBottom: 10 }}>исходный промпт · у клиента</Eyebrow>
          <div style={{ fontFamily: mono, fontSize: 13, lineHeight: 1.7 }}>{PARTS.map((p, i) => <span key={i} style={{ color: p.type ? c.txt : c.dim, background: p.type ? "rgba(229,72,77,0.10)" : "none", borderRadius: 3, padding: p.type ? "1px 3px" : 0 }}>{p.t}</span>)}</div>
        </Card>
        <div style={{ display: "grid", placeItems: "center" }}><div style={{ textAlign: "center" }}><ArrowRight size={22} color={c.cyan} /><div style={{ fontSize: 10, color: c.dim2, marginTop: 4 }}>&lt;40мс</div></div></div>
        <Card style={{ border: `1px solid ${c.cyan}55` }}>
          <Eyebrow style={{ marginBottom: 10 }}>уходит в модель</Eyebrow>
          <div style={{ fontFamily: mono, fontSize: 13, lineHeight: 1.7 }}>{PARTS.map((p, i) => { const mask = p.type && on[p.type]; return <span key={i} style={{ color: mask ? c.cyan : (p.type ? c.txt : c.dim), background: mask ? `${c.cyan}16` : "none", borderRadius: 3, padding: mask ? "1px 3px" : 0 }}>{mask ? p.tok : p.t}</span>; })}</div>
        </Card>
      </div>
      <Card style={{ marginTop: 16 }}>
        <Eyebrow style={{ marginBottom: 8 }}>ответ возвращается ре-персонализированным</Eyebrow>
        <div style={{ fontFamily: mono, fontSize: 13, color: c.txt }}>«Звонок <span style={{ color: c.green }}>Ивану Петрову</span> поставлен на 15:00. По сделке с <span style={{ color: c.green }}>ООО «Ромашка»</span> подготовлю КП к утру.»</div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}><Badge color={c.cyan} bg={`${c.cyan}12`}>рантайм-актив</Badge><Badge>on-prem · RU residency</Badge></div>
      </Card>
    </div>
  );
}

function Routing() {
  const [log, setLog] = useState([["вчера 21:14", "Claude Opus обновлён → роут переключён → 11 агентов продолжили работу без переписывания"]]);
  const swap = () => setLog([[new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), "смена модели смоделирована → failover на резерв → 11 агентов работают"], ...log]);
  return (
    <div>
      <Eyebrow>платформа · слой A</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Роутинг моделей</h1>
      <p style={{ color: c.dim, marginBottom: 18, maxWidth: 660 }}>Модель сменилась — агент не переписывается, переключается роут. Это механизм апгрейда: ответ на «кейсы устаревают каждые 3 месяца».</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginBottom: 18 }}>
        {models.map((m) => (
          <Card key={m.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontWeight: 600 }}>{m.name}</span><Badge color={c.violet}>#{m.rank} failover</Badge></div>
            <div style={{ fontSize: 12.5, color: c.dim }}>{m.routes}</div>
            <div style={{ marginTop: 10 }}><Badge color={c.cyan} bg={`${c.cyan}12`}>рантайм-актив</Badge></div>
          </Card>
        ))}
      </div>
      <button onClick={swap} style={{ display: "flex", gap: 8, alignItems: "center", background: "transparent", color: c.cyan, border: `1px solid ${c.cyan}`, borderRadius: 10, padding: "9px 14px", fontWeight: 600, cursor: "pointer", marginBottom: 16 }}><Route size={16} /> Смоделировать смену модели</button>
      <Card>
        <Eyebrow style={{ marginBottom: 10 }}>события роутинга</Eyebrow>
        {log.map(([ts, txt], i) => <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}><span style={{ fontFamily: mono, fontSize: 12, color: c.dim2, minWidth: 92 }}>{ts}</span><span style={{ fontSize: 13, color: c.txt }}>{txt}</span></div>)}
      </Card>
    </div>
  );
}

function MemoryView({ filter }) {
  const cid = filter === "all" ? "c1" : filter;
  const m = memory[cid];
  const Block = ({ title, rows }) => (
    <Card style={{ flex: 1, minWidth: 220 }}>
      <Eyebrow style={{ marginBottom: 10 }}>{title}</Eyebrow>
      {rows.length ? rows.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}><span style={{ fontSize: 13 }}>{r[0]}</span><span style={{ fontSize: 12, color: c.dim }}>{r[1]}{r[2] ? ` · ${r[2]}` : ""}</span></div>) : <span style={{ fontSize: 13, color: c.dim2 }}>пусто</span>}
    </Card>
  );
  return (
    <div>
      <Eyebrow>платформа · слой A</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Память клиента</h1>
      <p style={{ color: c.dim, marginBottom: 6, maxWidth: 660 }}>Чем дольше работает — тем больше знает. Это нельзя унести с собой. Здесь живёт switching cost.</p>
      <div style={{ fontFamily: mono, fontSize: 13, color: c.cyan, marginBottom: 18 }}>{cName(cid)} — осмыслено {m.messages.toLocaleString("ru-RU")} сообщений · {m.meetings} встреч</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><Block title="реестр людей" rows={m.people} /><Block title="контрагенты" rows={m.companies} /><Block title="цели · OKR" rows={m.okrs} /></div>
      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}><Badge color={c.cyan} bg={`${c.cyan}12`}>реестры — рантайм-актив клиента</Badge><Badge color={c.violet} bg={`${c.violet}12`}>методика ведения — шаблон-актив</Badge></div>
    </div>
  );
}

function Sparkline({ data, color }) {
  const max = Math.max(...data.map((d) => d.v)), min = Math.min(...data.map((d) => d.v));
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 64},${20 - ((d.v - min) / (max - min || 1)) * 18}`).join(" ");
  return <svg width="64" height="20"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" /></svg>;
}
function Evals() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <Eyebrow>платформа · слой A</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Eval · Health · Логи</h1>
      <p style={{ color: c.dim, marginBottom: 18, maxWidth: 660 }}>То, чем оправдывается подписка: мы видим, что каждый агент всё ещё делает свою работу — и первыми ловим деградацию.</p>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {agents.map((a, i) => {
          const ev = a.evals[0];
          return (
            <div key={a.id}>
              <div onClick={() => setOpen(open === a.id ? null : a.id)} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 64px 70px 24px", gap: 12, alignItems: "center", padding: "12px 16px", borderTop: i ? `1px solid ${c.line}` : "none", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}><HealthDot s={a.health} /><span style={{ fontWeight: 600 }}>{a.sol}</span><span style={{ fontSize: 12, color: c.dim }}>· {cName(a.client)}</span></div>
                <span style={{ fontSize: 13, color: c.dim }}>{ev.n}</span>
                <Sparkline data={ev.tr} color={HEALTH[a.health]} />
                <span style={{ fontFamily: mono, fontWeight: 700, color: HEALTH[a.health] }}>{ev.s.toFixed(2)}</span>
                <ChevronRight size={16} color={c.dim2} style={{ transform: open === a.id ? "rotate(90deg)" : "none", transition: ".15s" }} />
              </div>
              {open === a.id && <div style={{ padding: "4px 16px 14px", background: c.panelHi }}>{a.activity.map(([ts, txt, mdl], j) => <div key={j} style={{ display: "flex", gap: 12, padding: "6px 0", fontFamily: mono, fontSize: 12 }}><span style={{ color: c.dim2, minWidth: 48 }}>{ts}</span><span style={{ color: c.txt, flex: 1 }}>{txt}</span><span style={{ color: c.dim2 }}>{mdl}</span></div>)}</div>}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function Ledger() {
  const tip = { background: c.panel, border: `1px solid ${c.lineHi}`, borderRadius: 8, fontSize: 12 };
  return (
    <div>
      <Eyebrow>платформа · слой A</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Журнал внедрений</h1>
      <p style={{ color: c.dim, marginBottom: 20, maxWidth: 680 }}>Весь платформенный тезис на одном экране. Доля растёт = платформа. Стоит на месте = агентство, переиспользующее код.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <Eyebrow style={{ marginBottom: 10 }}>доля «легло в платформу» по внедрениям</Eyebrow>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={deployments} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={c.line} vertical={false} /><XAxis dataKey="seq" stroke={c.dim2} tickFormatter={(v) => `#${v}`} fontSize={11} /><YAxis stroke={c.dim2} domain={[0.4, 0.9]} tickFormatter={(v) => `${Math.round(v * 100)}%`} fontSize={11} />
              <Tooltip contentStyle={tip} labelFormatter={(v) => `внедрение #${v}`} formatter={(v) => [`${Math.round(v * 100)}%`, "в платформу"]} />
              <Line type="monotone" dataKey="share" stroke={c.violet} strokeWidth={2.4} dot={{ r: 3, fill: c.violet }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <Eyebrow style={{ marginBottom: 10 }}>библиотека активов · рантайм vs шаблон</Eyebrow>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={libraryGrowth} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid stroke={c.line} vertical={false} /><XAxis dataKey="seq" stroke={c.dim2} tickFormatter={(v) => `#${v}`} fontSize={11} /><YAxis stroke={c.dim2} fontSize={11} />
              <Tooltip contentStyle={tip} labelFormatter={(v) => `после #${v}`} />
              <Line type="monotone" dataKey="runtime" name="рантайм" stroke={c.cyan} strokeWidth={2.2} dot={false} /><Line type="monotone" dataKey="template" name="шаблон" stroke={c.violet} strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 12 }}><span style={{ color: c.cyan }}>● рантайм-активы</span><span style={{ color: c.violet }}>● шаблон-активы</span></div>
        </Card>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${c.line}` }}><Eyebrow>недавние активы в платформе</Eyebrow></div>
        {libAssets.map((r, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 90px 90px", gap: 12, alignItems: "center", padding: "11px 16px", borderTop: i ? `1px solid ${c.line}` : "none" }}><span style={{ fontSize: 13, fontWeight: 600 }}>{r[0]}</span><span style={{ fontSize: 12.5, color: c.dim }}>{r[1]}</span><Badge color={r[2] === "runtime" ? c.cyan : c.violet}>{r[2] === "runtime" ? "рантайм" : "шаблон"}</Badge><span style={{ fontFamily: mono, fontSize: 12.5, color: c.dim }}>×{r[3]} переисп.</span></div>)}
      </Card>
    </div>
  );
}

/* ─────────────  AGENT DASHBOARDS  ───────────── */
const Tile = ({ v, l, col }) => (
  <Card style={{ padding: 14 }}><div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: col || c.txt }}>{v}</div><div style={{ fontSize: 11.5, color: c.dim, marginTop: 3, lineHeight: 1.3 }}>{l}</div></Card>
);
const LivePill = ({ text }) => (
  <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12.5, fontWeight: 600, color: c.green, background: `${c.green}14`, border: `1px solid ${c.green}40`, borderRadius: 99, padding: "5px 12px" }}><HealthDot s="green" size={7} /> {text}</span>
);
const Node = ({ title, sub, color }) => (
  <div style={{ background: c.panelHi, border: `1px solid ${color ? color + "55" : c.line}`, borderRadius: 12, padding: "12px 14px", minWidth: 132 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>{sub && <div style={{ fontSize: 11, color: c.dim, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>}</div>
);
const Arrow = () => <ArrowRight size={18} color={c.dim2} style={{ flexShrink: 0 }} />;
const dashTip = { background: c.panel, border: `1px solid ${c.lineHi}`, borderRadius: 8, fontSize: 12 };

function HermesDash() {
  const k = [["24 500", "охват · Dubai/MENA", c.cyan], ["83 000", "показы топ-поста", c.amber], ["2×/день", "постов авто", c.txt], ["8", "в очереди", c.txt], ["4", "источника идей", c.txt], ["100%", "в твоём голосе", c.violet]];
  const feed = [["13:02", "🎙", "Голосовая получена → расшифрована офлайн"], ["13:01", "✅", "Черновик одобрен · 1 тап"], ["13:00", "⏰", "Напоминание: «дай одну вещь из сегодня»"], ["12:58", "🧠", "Топ-хук недели: самоирония (+38% охвата)"], ["12:55", "🛰", "Пост канала захвачен → очередь идей"], ["12:50", "🔥", "Дневная цель · стрик сохранён"]];
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
      <div><div style={{ fontSize: 17, fontWeight: 700 }}>Hermes — LinkedIn Autopilot</div><div style={{ fontSize: 12.5, color: c.dim }}>сырая мысль на входе · пост в твоём голосе на выходе · по расписанию</div></div>
      <LivePill text="LIVE · движок работает" />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(118px,1fr))", gap: 10, marginBottom: 18 }}>{k.map(([v, l, col], i) => <Tile key={i} v={v} l={l} col={col} />)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 16 }}>
      <Card>
        <Eyebrow style={{ marginBottom: 14 }}>поток продукта</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Node title="Ты · Telegram" sub="текст · голос · фото" /><Node title="Канал в TG" sub="посты → очередь идей" /><Node title="Доска идей" sub="ИИ-углы" /><Node title="Analytics .xlsx" sub="недельная эффективность" /></div>
          <Arrow /><Node title="🤖 Hermes Bot" sub="собирает всё · напоминает · берёт слот" color={c.cyan} /><Arrow /><Node title="✍️ ИИ-движок" sub="пишет в твоём голосе · ты одобряешь · 1 тап" color={c.amber} /><Arrow /><Node title="in LinkedIn" sub="2×/будни, авто" color={c.cyan} />
        </div>
        <div style={{ marginTop: 14, padding: "10px 12px", border: `1px dashed ${c.amber}55`, borderRadius: 10, fontSize: 12, color: c.dim }}>↑ обучающий цикл — правила голоса само-обновляются из аналитики; каждый пост улучшает следующий</div>
      </Card>
      <Card>
        <Eyebrow style={{ marginBottom: 12 }}>живая лента</Eyebrow>
        {feed.map(([ts, em, txt], i) => <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}><span style={{ fontSize: 15 }}>{em}</span><div><div style={{ fontSize: 12.5, color: c.txt, lineHeight: 1.35 }}>{txt}</div><div style={{ fontFamily: mono, fontSize: 10.5, color: c.dim2, marginTop: 2 }}>{ts} · GST</div></div></div>)}
      </Card>
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>{["voice→text · офлайн", "первый коммент · авто", "выходные · пропуск", "стрик · вкл", "09:00 & 18:00 · Дубай"].map((t, i) => <Badge key={i}>{t}</Badge>)}</div>
  </div>);
}

function ArgusDash() {
  const k = [["12 400", "сообщений осмыслено за месяц"], ["180", "встреч разобрано без CEO"], ["< 2 ч", "от конца встречи до протокола", c.amber], ["−34%", "времени CEO на операционку", c.green], ["95%", "задач с владельцем и сроком", c.green], ["7", "забытых целей возвращено", c.amber], ["4", "скрытых таланта подсвечено", c.violet], ["24/7", "без выходных"]];
  const res = [["🧭", "Брифы к встречам", "с привязкой к цели"], ["🎓", "Разборы 1:1", "зеркало для руководителя"], ["📌", "Протокол в чат", "итоги — сразу участникам"], ["🌙", "Сводка дня", "итоги · эмоции · движение по OKR"], ["🫀", "Находки", "забытые цели · скрытые таланты · риски"]];
  return (<div>
    <div style={{ marginBottom: 16 }}><div style={{ fontSize: 17, fontWeight: 700 }}>Argus — AI Chief of Staff</div><div style={{ fontSize: 12.5, color: c.dim }}>тихо слушает чаты и встречи · возвращает брифы, разборы, протоколы · растёт по грейдам</div></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 18 }}>{k.map(([v, l, col], i) => <Tile key={i} v={v} l={l} col={col} />)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,0.9fr) 1fr", gap: 16, alignItems: "start" }}>
      <Card><Eyebrow style={{ marginBottom: 12 }}>захват → ядро → результат</Eyebrow><div style={{ display: "flex", flexDirection: "column", gap: 6 }}><Node title="📥 Источники" sub="чаты · голос/фото · календарь · встречи" /><div style={{ textAlign: "center", color: c.dim2 }}>↓</div><Node title="🧠 ИИ-ядро" sub="память по людям · реестр · цели/OKR · история" color={c.violet} /><div style={{ textAlign: "center", color: c.dim2 }}>↓</div><Node title="📤 Результат" sub="брифы · разборы · протоколы · находки" color={c.cyan} /></div></Card>
      <Card><Eyebrow style={{ marginBottom: 12 }}>что отдаёт руководителю</Eyebrow>{res.map(([em, t, d], i) => <div key={i} style={{ display: "flex", gap: 11, padding: "10px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}><span style={{ fontSize: 16 }}>{em}</span><div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{t}</div><div style={{ fontSize: 12, color: c.dim }}>{d}</div></div></div>)}</Card>
    </div>
  </div>);
}

function SvodnoDash({ a }) {
  const k = [["₽ 8.4М", "выручка за месяц", c.txt], ["29%", "фудкост", c.green], ["24%", "ФОТ", c.green], ["₽ 1.2М", "дебиторка", c.amber], ["6%", "расхождение управленки/факт", c.amber]];
  const cash = [{ m: "Пн", v: 240 }, { m: "Вт", v: 280 }, { m: "Ср", v: 210 }, { m: "Чт", v: 320 }, { m: "Пт", v: 410 }, { m: "Сб", v: 520 }, { m: "Вс", v: 380 }];
  const pts = [["Тверская", 2.1, "green"], ["Невский", 1.8, "green"], ["Арбат", 1.4, "amber"], ["Лиговский", 0.9, "red"]];
  return (<div>
    <div style={{ marginBottom: 16 }}><div style={{ fontSize: 17, fontWeight: 700 }}>Сводно — финансовый дашборд</div><div style={{ fontSize: 12.5, color: c.dim }}>{cName(a.client)} · ДДС · консолидация · светофор дебиторки · GPT-правила учёта</div></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(128px,1fr))", gap: 10, marginBottom: 18 }}>{k.map(([v, l, col], i) => <Tile key={i} v={v} l={l} col={col} />)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card><Eyebrow style={{ marginBottom: 10 }}>денежный поток · неделя</Eyebrow><ResponsiveContainer width="100%" height={190}><LineChart data={cash} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke={c.line} vertical={false} /><XAxis dataKey="m" stroke={c.dim2} fontSize={11} /><YAxis stroke={c.dim2} fontSize={11} /><Tooltip contentStyle={dashTip} /><Line type="monotone" dataKey="v" stroke={c.green} strokeWidth={2.4} dot={false} /></LineChart></ResponsiveContainer></Card>
      <Card><Eyebrow style={{ marginBottom: 12 }}>выручка по точкам · ₽млн</Eyebrow>{pts.map(([n, v, h], i) => <div key={i} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span>{n}</span><span style={{ fontFamily: mono, color: HEALTH[h] }}>{v}</span></div><div style={{ height: 7, background: c.panelHi, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(v / 2.1) * 100}%`, background: HEALTH[h] }} /></div></div>)}</Card>
    </div>
  </div>);
}

function HostessDash({ a }) {
  const k = [["37", "броней сегодня", c.txt], ["82%", "загрузка вечер", c.green], ["₽ 3 200", "средний чек", c.txt], [a.evals[0].s.toFixed(2), "on-brand тон", HEALTH[a.health]], ["12", "допродаж · депозиты", c.violet]];
  const conv = [["19:00", "Гость", "Столик на 4 в субботу?"], ["19:00", "Хостес", "Готово — 21:00, у окна. Оставить депозит?"], ["18:40", "Гость", "Есть веранда?"], ["18:40", "Хостес", "Да, забронировала. Прислать меню?"]];
  return (<div>
    <div style={{ marginBottom: 16 }}><div style={{ fontSize: 17, fontWeight: 700 }}>ИИ-хостес — приём гостей</div><div style={{ fontSize: 12.5, color: c.dim }}>{cName(a.client)} · бронь · ответы · допродажа · фиксация в системе</div></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(128px,1fr))", gap: 10, marginBottom: 18 }}>{k.map(([v, l, col], i) => <Tile key={i} v={v} l={l} col={col} />)}</div>
    <Card><Eyebrow style={{ marginBottom: 12 }}>живой диалог</Eyebrow>{conv.map(([ts, who, txt], i) => <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}><span style={{ fontFamily: mono, fontSize: 11, color: c.dim2, minWidth: 42 }}>{ts}</span><span style={{ fontSize: 12, fontWeight: 600, color: who === "Хостес" ? c.amber : c.dim, minWidth: 54 }}>{who}</span><span style={{ fontSize: 13, flex: 1 }}>{txt}</span></div>)}</Card>
  </div>);
}

function KairosDash({ a }) {
  const kpi = [["6", "объектов управления"], ["2", "активные спринты", c.green], ["1", "гипотез в проверке", c.amber], ["0", "заблокированные задачи"]];
  const objs = ["Продажи новым клиентам", "Продажи действующим", "Партнёрское направление", "Продуктовое направление", "Квалификаторы и телеколлинг", "CX"];
  const cons = [
    ["операционное", "Продажи новым клиентам", "Низкая конверсия на встрече и дожиме из-за неточного диагностирования потребностей."],
    ["операционное", "Партнёрское направление", "Низкая маржинальность сделок: мультипликатор ~3 вместо 4. Поднять средний чек на 18 000 ₽."],
    ["тактическое", "Продажи новым клиентам", "Встреча назначена, но клиент не приходит (no-show)."],
    ["тактическое", "Продажи новым клиентам", "Встреча проведена, дальше отвал на дожиме и счёте."],
    ["операционное", "Продажи новым клиентам", "Диагностика предварительная: проверить два провала воронки."],
  ];
  const sprints = [["Продажи новым клиентам", "Снять ограничение по конверсии на встрече и дожиме", "4 задачи", "green"], ["Партнёрское направление", "Поднять средний чек партнёрских сделок", "3 задачи", "amber"]];
  const chat = [
    ["q", "Где сейчас главное ограничение и почему?"],
    ["a", "Главное ограничение — в объекте «Продажи новым клиентам»: низкая конверсия на встрече и дожиме из-за неточного диагностирования потребностей. Приоритет OPERATIONAL/ACTIVE — самое критичное прямо сейчас, по нему уже запущен спринт. Оно напрямую бьёт по конверсии и выручке: неточная диагностика → неверные предложения клиенту."],
  ];
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
      <div><div style={{ fontSize: 17, fontWeight: 700 }}>Kairos — Дашборд собственника</div><div style={{ fontSize: 12.5, color: c.dim }}>{cName(a.client)} · управление по объектам, ограничениям и спринтам · by Open Service</div></div>
      <Badge color={c.violet} bg={`${c.violet}12`}>build 26</Badge>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 18 }}>{kpi.map(([v, l, col], i) => <Tile key={i} v={v} l={l} col={col} />)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Eyebrow style={{ marginBottom: 10 }}>объекты управления</Eyebrow>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{objs.map((o, i) => <span key={i} style={{ fontSize: 12.5, background: c.panelHi, border: `1px solid ${c.line}`, borderRadius: 8, padding: "5px 10px" }}>{o}</span>)}</div>
        </Card>
        <Card>
          <Eyebrow style={{ marginBottom: 12 }}>главные ограничения · топ-5</Eyebrow>
          {cons.map(([tag, obj, txt], i) => (
            <div key={i} style={{ padding: "10px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}><Badge color={tag === "операционное" ? c.blue : c.violet} bg={tag === "операционное" ? `${c.blue}12` : `${c.violet}12`}>{tag}</Badge><span style={{ fontSize: 11.5, color: c.dim2 }}>{obj}</span></div>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>{txt}</div>
            </div>
          ))}
        </Card>
        <Card>
          <Eyebrow style={{ marginBottom: 12 }}>активные спринты</Eyebrow>
          {sprints.map(([obj, t, tasks, h], i) => (
            <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}>
              <HealthDot s={h} size={8} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, color: c.dim2 }}>{obj}</div><div style={{ fontSize: 13 }}>{t}</div></div>
              <span style={{ fontSize: 11.5, color: c.dim, whiteSpace: "nowrap" }}>{tasks}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${c.line}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: grad, display: "grid", placeItems: "center" }}><Bot size={14} color="#fff" /></div>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>Бизнес-коуч</span>
        </div>
        <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {chat.map(([role, txt], i) => (
            <div key={i} style={{ alignSelf: role === "q" ? "flex-end" : "flex-start", maxWidth: "92%" }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, padding: "10px 12px", borderRadius: 12,
                background: role === "q" ? grad : c.panelHi, color: role === "q" ? "#fff" : c.txt, border: role === "q" ? "none" : `1px solid ${c.line}` }}>{txt}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 14px 10px", display: "flex", gap: 8, flexWrap: "wrap" }}><Badge color={c.cyan}>🔎 Главное ограничение</Badge><Badge color={c.green}>✏️ Гипотезы и спринт</Badge></div>
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${c.line}`, display: "flex", gap: 8, alignItems: "center" }}>
          <input placeholder="Сообщение…" style={{ flex: 1, border: `1px solid ${c.line}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", color: c.txt, background: c.panelHi }} />
          <button style={{ background: grad, border: "none", borderRadius: 9, width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer" }}><Send size={15} color="#fff" /></button>
        </div>
      </Card>
    </div>
  </div>);
}

function SolutionDashboard({ a }) {
  const map = { Hermes: HermesDash, Argus: ArgusDash, "Сводно": SvodnoDash, "ИИ-хостес": HostessDash, Kairos: KairosDash };
  const D = map[a.sol];
  return D ? <D a={a} /> : <div style={{ color: c.dim }}>Дашборд для этого решения в работе.</div>;
}

function AgentDashboards({ onOpen }) {
  const sols = ["Hermes", "Argus", "Сводно", "ИИ-хостес", "Kairos"];
  const [sol, setSol] = useState("Kairos");
  const deploys = agents.filter((x) => x.sol === sol);
  const [aid, setAid] = useState(deploys[0].id);
  const cur = deploys.find((x) => x.id === aid) || deploys[0];
  return (
    <div>
      <Eyebrow>дашборды агентов</Eyebrow>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 4px" }}>Что агенты показывают в работе</h1>
      <p style={{ color: c.dim, marginBottom: 16, maxWidth: 640 }}>Продуктовая поверхность каждого решения — то, что видит клиент. Все собраны на одной платформе (слой A).</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {sols.map((s) => {
          const I = SOL[s].icon, on = s === sol, col = SOL[s].color, first = agents.find((x) => x.sol === s);
          return <button key={s} onClick={() => { setSol(s); setAid(first.id); }} style={{ display: "flex", gap: 8, alignItems: "center", background: on ? c.panel : "transparent", border: `1px solid ${on ? col : c.line}`, color: on ? c.txt : c.dim, borderRadius: 10, padding: "8px 13px", cursor: "pointer", fontWeight: 600, fontSize: 13, boxShadow: on ? "0 2px 8px rgba(20,30,50,0.06)" : "none" }}><I size={15} color={col} /> {s}</button>;
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: c.dim }}>у клиента:</span>
        {deploys.map((d) => <button key={d.id} onClick={() => setAid(d.id)} style={{ display: "flex", gap: 6, alignItems: "center", background: d.id === cur.id ? `${SOL[sol].color}14` : "transparent", border: `1px solid ${d.id === cur.id ? SOL[sol].color : c.line}`, color: d.id === cur.id ? c.txt : c.dim, borderRadius: 99, padding: "5px 11px", cursor: "pointer", fontSize: 12.5 }}><HealthDot s={d.health} size={7} /> {cName(d.client)}</button>)}
        <button onClick={() => onOpen(cur.id)} style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", background: "transparent", border: `1px solid ${c.line}`, color: c.cyan, borderRadius: 9, padding: "6px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>Открыть в кокпите <ChevronRight size={14} /></button>
      </div>
      <Card style={{ padding: 20 }}><SolutionDashboard a={cur} /></Card>
    </div>
  );
}

/* ─────────────  SOLUTION PREVIEW (из флота)  ───────────── */
function Landing({ data, col }) {
  const steps = [
    ["01 · Ситуация", data.situation, c.dim2],
    ["02 · Проблема", data.problem, c.red],
    ["03 · Решение", data.solution, col],
    ["04 · Выгода", data.benefit, c.green],
  ];
  return (
    <div style={{ marginBottom: 18 }}>
      <Eyebrow style={{ marginBottom: 12 }}>ситуация → проблема → решение → выгода</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(268px,1fr))", gap: 12 }}>
        {steps.map(([label, txt, ac], i) => (
          <Card key={i} style={{ borderLeft: `3px solid ${ac}`, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: ac, textTransform: "uppercase" }}>{label}</span>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: c.txt }}>{txt}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
function SolutionPreview({ sol, onBack, onOpen }) {
  const s = SOL[sol], I = s.icon, col = s.color, soon = !!s.soon;
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    const url = window.location.origin + window.location.pathname + "#/solution/" + encodeURIComponent(sol);
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  };
  const order = { green: 0, amber: 1, red: 2 };
  const deploys = agents.filter((x) => x.sol === sol);
  const demo = [...deploys].sort((a, b) => order[a.health] - order[b.health])[0];
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: c.dim, cursor: "pointer", fontSize: 13, marginBottom: 14 }}>← Флот агентов</button>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${col}2e, ${col}0d)`, border: `1px solid ${col}40`, flexShrink: 0 }}><I size={32} color={col} /></div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{sol}</h1>
            <Badge color={AGENT_CATS[s.cat]} bg={`${AGENT_CATS[s.cat]}12`}>{s.cat}</Badge>
            <Badge color={col} bg={`${col}12`}>{soon ? "скоро" : "агент"}</Badge>
          </div>
          <div style={{ fontSize: 13.5, color: c.dim, marginTop: 4 }}>{s.sub} · {soon ? "скоро в кокпите" : `развёрнут у ${deploys.length} клиентов`}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={copyLink} title="Скопировать ссылку на карточку" style={{ display: "flex", gap: 6, alignItems: "center", background: "transparent", border: `1px solid ${c.line}`, color: copied ? c.green : c.dim, borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{copied ? <><Check size={15} /> Скопировано</> : <><Link2 size={15} /> Ссылка</>}</button>
          {soon
            ? <span style={{ display: "flex", gap: 6, alignItems: "center", background: `${col}12`, color: col, border: `1px solid ${col}40`, borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13 }}>Скоро в кокпите</span>
            : <button onClick={() => onOpen(demo.id)} style={{ display: "flex", gap: 6, alignItems: "center", background: grad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Хочу такого себе <ArrowRight size={15} /></button>}
        </div>
      </div>
      <Card style={{ marginBottom: 18, borderLeft: `3px solid ${col}` }}>
        <div style={{ fontSize: 14.5, lineHeight: 1.55, color: c.txt }}>{s.pitch}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>{s.tags.map((t) => <Badge key={t} color={c.dim}>{t}</Badge>)}</div>
      </Card>
      {s.landing && <Landing data={s.landing} col={col} />}
      {soon ? (
        <Card style={{ borderLeft: `3px solid ${col}`, background: c.panelHi }}>
          <Eyebrow style={{ marginBottom: 8 }}>статус разработки</Eyebrow>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: c.txt }}>Фаза 1 — коннектор к hh.ru и зеркало откликов — уже на проде. Модуль оценки (светофор по резюме) проектируется по ТЗ. Живой демо-дашборд появится здесь, как только оценка выйдет в кокпит.</div>
        </Card>
      ) : (<>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>живой демо-дашборд · {cName(demo.client)}</Eyebrow>
          <button onClick={() => onOpen(demo.id)} style={{ display: "flex", gap: 6, alignItems: "center", background: "transparent", border: `1px solid ${c.line}`, color: c.cyan, borderRadius: 9, padding: "6px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>Открыть внедрение в кокпите <ChevronRight size={14} /></button>
        </div>
        <Card style={{ padding: 20 }}><SolutionDashboard a={demo} /></Card>
      </>)}
    </div>
  );
}

/* ─────────────  AGENT DETAIL  ───────────── */
function AgentDetail({ id, onBack, go }) {
  const a = agents.find((x) => x.id === id);
  const I = SOL[a.sol].icon, col = SOL[a.sol].color;
  const tagColor = (t) => (t === "platform" ? c.green : c.dim2);
  const [tab, setTab] = useState("dashboard");
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: c.dim, cursor: "pointer", fontSize: 13, marginBottom: 14 }}>← Мои агенты</button>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 22 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", background: `${col}1a`, border: `1px solid ${col}40` }}><I size={24} color={col} /></div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{a.sol} <span style={{ color: c.dim, fontWeight: 400, fontSize: 16 }}>@ {cName(a.client)}</span></div>
          <div style={{ fontSize: 13, color: c.dim, display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}><HealthDot s={a.health} /> {a.note || "работает штатно"} · {SOL[a.sol].sub}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18, borderBottom: `1px solid ${c.line}` }}>
        {[["dashboard", "Дашборд агента"], ["cockpit", "В кокпите"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", color: tab === k ? c.txt : c.dim, fontSize: 13.5, fontWeight: 600, padding: "8px 4px", marginRight: 14, cursor: "pointer", borderBottom: `2px solid ${tab === k ? c.cyan : "transparent"}` }}>{l}</button>)}
      </div>

      {tab === "dashboard" && <SolutionDashboard a={a} />}

      {tab === "cockpit" && (<>
        {a.grade != null ? (
          <Card style={{ marginBottom: 16 }}>
            <Eyebrow style={{ marginBottom: 14 }}>лестница грейдов · продукт = роль, которую растят</Eyebrow>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {GRADES.map((g) => { const cur = g.g === a.grade, done = g.g < a.grade; return (
                <div key={g.g} style={{ flex: "1 1 150px", minWidth: 150, padding: 12, borderRadius: 10, background: cur ? `${col}14` : c.panelHi, border: `1px solid ${cur ? col : c.line}`, opacity: done || cur ? 1 : 0.55 }}>
                  <div style={{ fontFamily: mono, fontSize: 12, color: cur ? col : c.dim2, fontWeight: 700 }}>G{g.g}{cur ? " · сейчас" : ""}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, margin: "4px 0" }}>{g.t}</div>
                  <div style={{ fontSize: 11.5, color: c.dim }}>{g.d}</div>
                </div>); })}
            </div>
            <div style={{ fontSize: 12, color: c.dim2, marginTop: 12 }}>Бэклог = индивидуальный план развития сотрудника. Рост по грейдам = expansion-выручка.</div>
          </Card>
        ) : (
          <Card style={{ marginBottom: 16 }}><Eyebrow style={{ marginBottom: 8 }}>уровень внедрения</Eyebrow><div style={{ fontSize: 18, fontWeight: 700, color: col }}>{a.level}</div><div style={{ fontSize: 12.5, color: c.dim, marginTop: 4 }}>{a.level === "0–1" ? "аудит → советник" : a.level === "2–3" ? "ассистент — закрывает рутину" : "агент — цикл PDCA"}</div></Card>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <Eyebrow style={{ marginBottom: 12 }}>на чём стоит · опора в слой A</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <Row label="коннекторы" v={a.conns.join(" · ")} onClick={() => go("connectors")} />
              <Row label="модель" v={models.find((m) => m.id === a.model)?.name} onClick={() => go("routing")} />
              <Row label="прокси" v={a.uses.includes("proxy") ? "включён" : "—"} onClick={() => go("proxy")} />
              <Row label="память" v={a.uses.includes("memory") ? "ведётся" : "—"} onClick={() => go("memory")} />
              <Row label="evals" v={a.evals[0].n + " · " + a.evals[0].s.toFixed(2)} onClick={() => go("evals")} />
            </div>
          </Card>
          <Card><Eyebrow style={{ marginBottom: 12 }}>активность</Eyebrow>{a.activity.map(([ts, txt], i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: i ? `1px solid ${c.line}` : "none" }}><span style={{ fontFamily: mono, fontSize: 12, color: c.dim2, minWidth: 44 }}>{ts}</span><span style={{ fontSize: 13, flex: 1 }}>{txt}</span></div>)}</Card>
        </div>
        <Card style={{ marginTop: 16, border: `1px solid ${c.violet}55` }}>
          <Eyebrow style={{ marginBottom: 4 }}>что это внедрение положило в платформу — измерено</Eyebrow>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}><span style={{ fontSize: 12, color: c.dim }}>каждый актив помечен: переиспользуемо (платформа) или одноразово (клей)</span><span style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: c.violet }}>{Math.round(a.share * 100)}%</span></div>
          {a.deposited.map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${c.line}` }}><span style={{ fontSize: 13 }}>{d.a}</span><div style={{ display: "flex", gap: 6 }}>{d.type !== "—" && <Badge color={d.type === "runtime" ? c.cyan : c.violet}>{d.type === "runtime" ? "рантайм" : "шаблон"}</Badge>}<Badge color={tagColor(d.tag)} bg={d.tag === "platform" ? `${c.green}12` : "transparent"}>{d.tag === "platform" ? "→ платформа" : "клей"}</Badge></div></div>)}
        </Card>
      </>)}
    </div>
  );
}
const Row = ({ label, v, onClick }) => (
  <div onClick={onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "4px 0" }}><span style={{ fontSize: 12.5, color: c.dim }}>{label}</span><span style={{ fontSize: 13, color: c.cyan, display: "flex", gap: 4, alignItems: "center" }}>{v} <ChevronRight size={13} /></span></div>
);

/* ─────────────  SHELL  ───────────── */
const NAV = [
  { sec: "обзор", items: [["fleet", "Флот агентов", LayoutGrid], ["myagents", "Мои агенты", Bot]] },
  { sec: "дашборды агентов", items: [["dashboards", "Дашборды агентов", BarChart3]] },
  { sec: "платформа · слой A", items: [["connectors", "Коннекторы", Plug], ["proxy", "Прокси приватности", ShieldCheck], ["routing", "Роутинг моделей", Route], ["memory", "Память клиента", Brain], ["evals", "Eval · Health · Логи", Activity], ["ledger", "Журнал внедрений", History]] },
];

export default function App() {
  const [view, setView] = useState("fleet");
  const [agent, setAgent] = useState(null);
  const [solName, setSolName] = useState(null);
  const [client, setClient] = useState("all");
  const [navOpen, setNavOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => { const f = () => setNarrow(window.innerWidth < 860); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);

  // deep-link через hash: прямая ссылка на карточку агента, напр. #/solution/Hermes или #/agent/a5
  const views = NAV.flatMap((g) => g.items.map(([v]) => v));
  useEffect(() => {
    const apply = () => {
      let raw = window.location.hash.replace(/^#\/?/, "");
      try { raw = decodeURIComponent(raw); } catch { return; }
      const [seg, arg] = raw.split("/");
      if (seg === "solution" && arg && Object.prototype.hasOwnProperty.call(SOL, arg)) { setSolName(arg); setAgent(null); setView("solution"); }
      else if (seg === "agent" && arg && agents.some((a) => a.id === arg)) { setAgent(arg); setView("agent"); }
      else if (seg && views.includes(seg)) { setAgent(null); setView(seg); }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  useEffect(() => {
    const h = view === "solution" && solName ? `/solution/${encodeURIComponent(solName)}`
      : view === "agent" && agent ? `/agent/${agent}` : `/${view}`;
    if ("#" + h !== window.location.hash) window.history.replaceState(null, "", "#" + h);
  }, [view, solName, agent]);

  const open = (id) => { setAgent(id); setView("agent"); };
  const openSol = (s) => { setSolName(s); setView("solution"); };
  const goto = (v) => { setView(v); setAgent(null); setNavOpen(false); };

  const Sidebar = (
    <div style={{ width: 234, background: c.bg2, borderRight: `1px solid ${c.line}`, padding: "18px 12px", display: "flex", flexDirection: "column", gap: 18, height: "100%", boxSizing: "border-box", position: narrow ? "fixed" : "relative", zIndex: 40, left: narrow && !navOpen ? -260 : 0, transition: "left .2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 8px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: grad, display: "grid", placeItems: "center" }}><CircleDot size={17} color="#fff" /></div>
        <div><div style={{ fontWeight: 700, fontSize: 15 }}>Слаживание</div><div style={{ fontSize: 10.5, color: c.dim2, letterSpacing: .5 }}>КОКПИТ · СЛОЙ A</div></div>
      </div>
      {NAV.map((g) => (
        <div key={g.sec}>
          <Eyebrow style={{ padding: "0 8px 8px" }}>{g.sec}</Eyebrow>
          {g.items.map(([v, label, Icon]) => { const active = view === v || (v === "myagents" && view === "agent") || (v === "fleet" && view === "solution"); return (
            <div key={v} onClick={() => goto(v)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 10px", borderRadius: 9, cursor: "pointer", marginBottom: 2, fontSize: 13.5, background: active ? "rgba(20,30,50,0.05)" : "transparent", color: active ? c.txt : c.dim, borderLeft: `2px solid ${active ? c.cyan : "transparent"}` }}><Icon size={16} color={active ? c.cyan : c.dim2} /> {label}</div>); })}
        </div>
      ))}
      <div style={{ marginTop: "auto", fontSize: 10.5, color: c.dim2, padding: "0 8px" }}>демо-данные · обезличено</div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: c.bg, color: c.txt, fontFamily: sans, overflow: "hidden" }}>
      {Sidebar}
      {narrow && navOpen && <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 30 }} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: `1px solid ${c.line}`, background: c.bg2, position: "sticky", top: 0, zIndex: 20, flexWrap: "wrap", minWidth: 0 }}>
          {narrow && <Menu size={20} color={c.dim} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setNavOpen(true)} />}
          <select value={client} onChange={(e) => setClient(e.target.value)} style={{ background: c.panel, color: c.txt, border: `1px solid ${c.lineHi}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none", minWidth: 0, maxWidth: narrow ? 200 : "none" }}>
            <option value="all">Все клиенты</option>{clients.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
          </select>
          {!narrow && <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center", fontSize: 12.5, color: c.dim, fontFamily: mono }}><span>5 клиентов</span><span>11 агентов</span><span style={{ color: c.red, display: "flex", gap: 5, alignItems: "center" }}><HealthDot s="red" size={7} /> 3 деградации</span></div>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: narrow ? "20px 16px" : "28px 32px" }}>
          {view === "fleet" && <Catalog onOpenSol={openSol} />}
          {view === "solution" && <SolutionPreview sol={solName} onBack={() => goto("fleet")} onOpen={open} />}
          {view === "myagents" && <MyAgents filter={client} onOpen={open} />}
          {view === "dashboards" && <AgentDashboards onOpen={open} />}
          {view === "connectors" && <Connectors />}
          {view === "proxy" && <Proxy />}
          {view === "routing" && <Routing />}
          {view === "memory" && <MemoryView filter={client} />}
          {view === "evals" && <Evals />}
          {view === "ledger" && <Ledger />}
          {view === "agent" && <AgentDetail id={agent} onBack={() => goto("myagents")} go={goto} />}
        </div>
      </div>
    </div>
  );
}
