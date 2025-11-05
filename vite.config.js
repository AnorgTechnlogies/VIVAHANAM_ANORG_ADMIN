// vite.config.js → Admin Panel[](http://localhost:5174)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Alias: @ → /src (optional but useful)
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  // Server config (must be inside defineConfig, not inside resolve!)
  server: {
    host: true,     // Allows access via LAN: http://192.168.1.9:5174
    port: 5174,     // Admin panel runs on 5174
    strictPort: true, // Fail if 5174 is taken
    open: true,     // Auto-open browser

    // Proxy all /api calls to backend
    proxy: {
      "/api": {
        target: "http://localhost:8000", // Your Express backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});