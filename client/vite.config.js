import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../server/public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": { target: "https://server-0fb4.onrender.com" },
      "/auth": { target: "https://server-0fb4.onrender.com" },
    },
  },
});
