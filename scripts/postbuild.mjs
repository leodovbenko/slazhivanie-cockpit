// Собирает финальную dist/ для GitHub Pages:
//   dist/index.html      — клиентский сайт (статика из site/)
//   dist/platform/...    — кокпит (собран Vite, уже на месте)
//   dist/CNAME           — кастомный домен
import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

mkdirSync(dist, { recursive: true });

// 1) клиентский сайт -> корень
copyFileSync(resolve(root, "site/index.html"), resolve(dist, "index.html"));

// 2) кастомный домен для Pages
writeFileSync(resolve(dist, "CNAME"), "slazhivanie.ru\n");

console.log("postbuild: dist/index.html (сайт) + dist/CNAME готовы, платформа в dist/platform/");
