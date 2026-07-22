import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolveLlmBaseUrl } from "../../lib/llm-defaults";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@atlas/llm-defaults": path.resolve(__dirname, "../../lib/llm-defaults.ts"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/llm": {
        target: "https://api.deepseek.com/v1",
        changeOrigin: true,
        rewrite: () => "/chat/completions",
        router: (req) => {
          const base = req.headers["x-llm-base-url"];
          if (typeof base === "string" && base.trim()) {
            return resolveLlmBaseUrl(base);
          }
          return "https://api.deepseek.com/v1";
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          "lunar-javascript": ["lunar-javascript"],
          iztro: ["iztro"],
          "astronomy-engine": ["astronomy-engine"],
        },
      },
    },
  },
});
