import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        contador: resolve(__dirname, "contador/index.html"),
        config: resolve(__dirname, "config/index.html"),
      },
    },
  },
  server: {
    // Em dev, garante que /contador e /config sirvam os HTML certos
  },
});
