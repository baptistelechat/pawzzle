import { defineConfig, minimalPreset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimalPreset,
    maskable: {
      sizes: [512],
      resizeOptions: { background: "#ff8a65" },
    },
    apple: {
      sizes: [180],
      resizeOptions: { background: "#ff8a65" },
    },
  },
  images: ["public/icon.svg"],
});
