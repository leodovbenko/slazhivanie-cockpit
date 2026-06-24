import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // относительный base — собранная статика работает на любом хосте
  // (GitHub Pages /repo/, Netlify, Vercel, открытие файла локально)
  base: "./",
  server: { host: "127.0.0.1", port: 5173, open: false },
});
