#!/usr/bin/env node
// Второй угол к Fable: рисуем кликабельный HTML-прототип моделью Kimi K3
// (Moonshot, open-weights) через OpenRouter. Fable даёт свой вариант через
// харнесс (Agent model:'fable'), K3 — свой через этот скрипт. Итог — две
// независимые версии одного брифа, «бери оба и заставь спорить».
//
// Использование:
//   node scripts/proto-k3.mjs "бриф одной строкой" [--out proto-имя--k3.html]
//   node scripts/proto-k3.mjs --file brief.md [--out ...]
//
// Ключ: берётся из env OPENROUTER_API_KEY, иначе читается из ~/slazhivanie/.env
// Модель: moonshotai/kimi-k3 (переопределяется env PROTO_K3_MODEL)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const MODEL = process.env.PROTO_K3_MODEL || 'moonshotai/kimi-k3';

function die(msg) { console.error('✖ ' + msg); process.exit(1); }

function loadKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  // fallback: читаем ~/slazhivanie/.env, там держится боевой ключ
  const envPath = join(homedir(), 'slazhivanie', '.env');
  if (existsSync(envPath)) {
    const m = readFileSync(envPath, 'utf8').match(/^\s*OPENROUTER_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^['"]|['"]$/g, '');
  }
  die('нет OPENROUTER_API_KEY (ни в env, ни в ~/slazhivanie/.env)');
}

function parseArgs(argv) {
  const a = { out: null, file: null, brief: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') a.out = argv[++i];
    else if (argv[i] === '--file') a.file = argv[++i];
    else a.brief.push(argv[i]);
  }
  return a;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'prototype';
}

// K3 любит оборачивать в ```html — снимаем ограждение, оставляем чистый HTML
function stripFences(t) {
  const m = t.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (m) return m[1].trim();
  return t.trim();
}

const SYSTEM = `Ты — сильный фронтенд/продукт-дизайнер. Твоя задача — по брифу собрать ОДИН самодостаточный кликабельный HTML-прототип.
Требования:
- Верни ТОЛЬКО код HTML-файла. Без пояснений, без markdown-ограждений.
- Всё inline: <style> и <script> внутри файла, без внешних зависимостей и CDN (кроме шрифтов Google Fonts, если нужно).
- Современно, аккуратно, адаптивно (мобайл тоже). Реальные состояния, а не заглушки-картинки.
- Текст интерфейса — на русском, если в брифе не сказано иное.
- Никакого «lorem ipsum»: осмысленный демо-контент по брифу.`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let brief = args.brief.join(' ').trim();
  if (args.file) brief = readFileSync(args.file, 'utf8').trim();
  if (!brief) die('пустой бриф. Пример: node scripts/proto-k3.mjs "лендинг для ИИ-рекрутёра"');

  const key = loadKey();
  const out = args.out || `proto-${slugify(brief.split('\n')[0])}--k3.html`;

  console.error(`▸ K3 (${MODEL}) рисует прототип по брифу…`);
  const t0 = Date.now();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://slazhivanie.ru',
      'X-Title': 'Slazhivanie proto two-angles',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: brief },
      ],
      temperature: 0.7,
      max_tokens: 32000,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    die(`OpenRouter ${res.status}: ${body.slice(0, 400)}`);
  }
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) die('пустой ответ модели: ' + JSON.stringify(data).slice(0, 400));

  const html = stripFences(raw);
  writeFileSync(out, html);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const usage = data.usage ? ` · токены: ${data.usage.prompt_tokens}+${data.usage.completion_tokens}` : '';
  console.error(`✔ ${out} (${html.length} симв., ${secs}с${usage})`);
  console.log(out);
}

main().catch((e) => die(e?.message || String(e)));
