// Авто-регенерация запечённого baseline «Флота» в site/index.html из живого /roles.
//
// ЗАЧЕМ: секция «Флот» между маркерами <!-- roles:auto:start/end --> запечена статикой (краулеры/
// без-JS видят её сразу — SEO). Живой <script> в index.html на загрузке патчит из uklad.ai/roles
// ТОЛЬКО пилюлю зрелости и цифру KPI. Но запечённый baseline для без-JS дрейфует (напр. Первый/Гермес/
// Рекрутёр давно «Зрелые», а в статике висели «Обкатка»). Этот скрипт печёт ровно те же поля при сборке.
//
// ХИРУРГИЧНО (правило обратной совместимости): трогаем в каждой карточке ТОЛЬКО .fpill (класс-тон +
// title + текст) и .fkpi (текст+hidden) — как делает live-fetch. Курированный контент (имя, .kind,
// blurb, теги, помощники, ссылка «Подробнее», аватар) — РУЧНОЙ, он намеренно расходится с /roles
// (site-блёрбы короче, Легал показан «часть Первого») и НЕ перегенерируется.
//
// Устойчивость: /roles недоступен / пустой ответ / нет маркеров → скрипт НИЧЕГО не пишет и выходит с 0
// (остаётся прежний запечённый baseline, деплой не падает). Живой <script> не трогаем — синк на лету цел.
//
// Запуск: `npm run bake-roles` вручную либо авто как `prebuild` перед `npm run build` (npm сам зовёт).
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROLES_URL = process.env.ROLES_URL || "https://uklad.ai/roles";
const FILE = fileURLToPath(new URL("../site/index.html", import.meta.url));
const START = "<!-- roles:auto:start -->";
const END = "<!-- roles:auto:end -->";
const TONES = new Set(["green", "amber", "violet", "blue"]); // допустимые тона (как в live-fetch)

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// разделитель тысяч неразрывным пробелом-сущностью — байт-в-байт как в запечённом («1&nbsp;206»)
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "&nbsp;");

const bail = (msg) => { console.warn(`bake-roles: ${msg} — оставляю запечённый baseline`); process.exit(0); };

const res = await fetch(ROLES_URL).catch(() => null);
if (!res || !res.ok) bail(`/roles недоступен (${res ? res.status : "нет сети"})`);
const data = await res.json().catch(() => null);
if (!data || !Array.isArray(data.roles) || data.roles.length === 0) bail("пустой ответ /roles");

let html = await readFile(FILE, "utf8");
const s = html.indexOf(START);
const e = html.indexOf(END);
if (s < 0 || e < 0 || e < s) bail("маркеры roles:auto не найдены");

let block = html.slice(s, e);
let patched = 0;
for (const role of data.roles) {
  if (!role || !role.roleId) continue;
  // локализуем <article> именно этой роли по data-role-id (не заденем соседей)
  const idEsc = String(role.roleId).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const artRe = new RegExp(`(<article\\b[^>]*data-role-id="${idEsc}"[\\s\\S]*?<\\/article>)`);
  block = block.replace(artRe, (art) => {
    let a = art;
    if (role.statusLabel) {
      const tone = TONES.has(role.statusTone) ? role.statusTone : "blue";
      a = a.replace(
        /<span class="fpill[^"]*"[^>]*>[\s\S]*?<\/span>/,
        `<span class="fpill ${tone}" title="${esc(role.statusHint)}">${esc(role.statusLabel)}</span>`,
      );
    }
    const kpi = role.kpiCount > 0 && role.kpiUnit
      ? `<div class="fkpi">${fmt(role.kpiCount)}&nbsp;${esc(role.kpiUnit)}</div>`
      : `<div class="fkpi" hidden></div>`;
    a = a.replace(/<div class="fkpi"[^>]*>[\s\S]*?<\/div>/, kpi);
    if (a !== art) patched++;
    return a;
  });
}

const next = html.slice(0, s) + block + html.slice(e);
if (next === html) { console.log("bake-roles: baseline уже свеж, изменений нет"); process.exit(0); }
await writeFile(FILE, next);
console.log(`bake-roles: обновлён baseline «Флота» из ${ROLES_URL} — тронуто карточек ~${patched}/${data.roles.length}`);
