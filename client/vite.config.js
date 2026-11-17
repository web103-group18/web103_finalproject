import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": { target: "https://server-0fb4.onrender.com", changeOrigin: true },
      "/auth": { target: "https://server-0fb4.onrender.com", changeOrigin: true },
    },
  },
});
