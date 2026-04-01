import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev only: proxy /api to Express. Default backend PORT=5001 (see backend/.env).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
  },
});
