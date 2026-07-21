import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { qrcode } from "vite-plugin-qrcode";
import checker from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    qrcode(),
    checker({ typescript: true, eslint: { lintCommand: "eslint ." } }),
    mkcert(),
    mode === "analyze" &&
      visualizer({ open: true, gzipSize: true, template: "treemap" }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"] },
      manifest: {
        name: "Pawzzle",
        short_name: "Pawzzle",
        description:
          "Jeu de puzzle logique : placer un pion unique par ligne, colonne et région, sans contact entre deux pions adjacents.",
        theme_color: "#ff8a65",
        background_color: "#fff8f0",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
