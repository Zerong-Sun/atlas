import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
const routerModule = (name: string) => path.join(path.dirname(require.resolve(`${name}/package.json`)), "dist/index.js");

export default defineConfig({
  resolve: {
    // Web uses React 18; hoisted router dependencies must not bind Expo's React 19.
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      // The CJS entry bypasses Vite resolution via require(); use ESM so dedupe
      // applies to Router's hooks too in this React 18 / React 19 monorepo.
      "react-router": routerModule("react-router"),
      "react-router-dom": routerModule("react-router-dom"),
    },
  },
  test: {
    environment: "node",
    server: { deps: { inline: ["react-router", "react-router-dom"] } },
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
