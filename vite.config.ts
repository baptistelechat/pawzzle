import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { qrcode } from "vite-plugin-qrcode";
import checker from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    qrcode(),
    checker({ typescript: true, eslint: { lintCommand: "eslint ." } }),
    mkcert(),
    mode === "analyze" &&
      visualizer({ open: true, gzipSize: true, template: "treemap" }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
