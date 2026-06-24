import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // кокпит/платформа живёт под /platform/ на домене
  base: "/platform/",
  // собираем платформу в поддиректорию dist/platform;
  // клиентский сайт и CNAME кладёт postbuild в корень dist/
  build: { outDir: "dist/platform", emptyOutDir: true },
  server: { host: "127.0.0.1", port: 5173, open: false },
});
