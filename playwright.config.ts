import { defineConfig, devices } from "playwright/test";

const port = Number(process.env.E2E_PORT ?? 3107);
const host = "127.0.0.1";
const baseURL = `http://${host}:${port}`;
const apiPort = Number(process.env.E2E_API_PORT ?? 8080);
const apiBaseURL = `http://localhost:${apiPort}`;
const apiHealthURL = `http://${host}:${apiPort}`;
const browserChannel = process.env.E2E_BROWSER_CHANNEL;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const skipWebServer = process.env.E2E_SKIP_WEBSERVER === "true";
const chromiumUse = browserChannel
  ? { ...devices["Desktop Chrome"], channel: browserChannel }
  : { ...devices["Desktop Chrome"] };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "e2e/.report", open: "never" }]],
  outputDir: "e2e/.results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: skipWebServer
    ? undefined
    : [
        {
          command: `node e2e/mock-api.mjs`,
          url: `${apiHealthURL}/healthz`,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
          env: {
            ...process.env,
            E2E_API_PORT: String(apiPort),
          },
        },
        {
          command: `${npmCommand} run dev -- --host ${host} --port ${port}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            VITE_API_BASE_URL: `${apiBaseURL}/api/v1`,
            VITE_AUTH_API_BASE_URL: apiBaseURL,
            VITE_AUTH_LOGIN_URL: `${baseURL}/auth/login`,
            VITE_BIDDING_WS_URL: "ws://127.0.0.1:18082",
          },
        },
      ],
  projects: [
    {
      name: "chromium",
      use: chromiumUse,
    },
  ],
});
