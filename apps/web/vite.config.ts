import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1", // <-- Força o IPv4 (evita o bloqueio do ::1)
    port: 3000,        // <-- Porta nova
    proxy: {
      "/api": "http://localhost:4001",
    },
  },
});