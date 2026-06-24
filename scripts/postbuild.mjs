// Собирает финальную dist/ для GitHub Pages:
//   dist/index.html, favicon.svg, og.png — клиентский сайт (статика из site/)
//   dist/platform/...                    — кокпит (собран Vite, уже на месте)
//   dist/CNAME                           — кастомный домен
import { cpSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

// весь клиентский сайт -> корень dist (кроме исходного og.svg)
cpSync(resolve(root, "site"), dist, {
  recursive: true,
  filter: (src) => !src.endsWith("og.svg"),
});

// кастомный домен для Pages
writeFileSync(resolve(dist, "CNAME"), "slazhivanie.ru\n");

console.log("postbuild: сайт (index.html, favicon.svg, og.png) + CNAME в корне dist; платформа в dist/platform/");
