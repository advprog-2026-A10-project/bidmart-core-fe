import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const coreApiTarget = env.VITE_DEV_CORE_API_PROXY_TARGET?.trim() || "http://localhost:8081";

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      proxy: {
        "/api": {
          target: coreApiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
