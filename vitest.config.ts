import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    pool: "vmForks",
    globals: true,
    setupFiles: ["./app/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.react-router/**", "e2e/**"],
    env: {
      VITE_API_BASE_URL: "http://localhost",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      exclude: [
        "node_modules/**",
        "build/**",
        ".react-router/**",
        "app/test/**",
        "**/*.config.{ts,js}",
        "**/index.ts",
        "app/routes/**",
        "app/root.tsx",
      ],
    },
  },
});
