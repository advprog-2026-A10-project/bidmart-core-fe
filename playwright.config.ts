import { defineConfig, devices } from "playwright/test";

const port = Number(process.env.E2E_PORT ?? 3107);
const host = "127.0.0.1";
const baseURL = `http://${host}:${port}`;
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
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "e2e/.report", open: "never" }],
  ],
  outputDir: "e2e/.results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: `${npmCommand} run dev -- --host ${host} --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          VITE_API_BASE_URL: `${baseURL}/api/v1`,
          VITE_BIDDING_WS_URL: "ws://127.0.0.1:18082",
        },
    },
  projects: [
    {
      name: "chromium",
      use: chromiumUse,
    },
  ],
});
