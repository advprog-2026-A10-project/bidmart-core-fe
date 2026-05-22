# BidMart Core FE E2E Tests

This folder is intentionally independent from the application code. It only adds browser-level smoke and UI flow checks for the current implemented frontend surface.

The E2E suite includes a small mock API server in `mock-api.mjs`. It exists only for Playwright runs so route guards and API-backed pages can be tested without depending on the real backend.

Current scope:

- order and notification pages with mocked API responses
- bidding pages that already use local mock payloads
- catalog, seller listing, and wallet route smoke checks

Run locally from `bidmart-core-fe`:

```bash
pnpm exec playwright test
```

On Windows, if `pnpm` is not available but dependencies already exist:

```powershell
node_modules\.bin\playwright.cmd test
```

On Windows, if the managed dev server does not shut down cleanly, run the mock API and app server manually:

```powershell
$env:E2E_API_HOST = "127.0.0.1"
$env:E2E_API_PORT = "18081"
node e2e/mock-api.mjs
```

In a second terminal:

```powershell
$env:VITE_API_BASE_URL = "http://127.0.0.1:18081/api/v1"
$env:VITE_BIDDING_WS_URL = "ws://127.0.0.1:18082"
npm.cmd run dev -- --host 127.0.0.1 --port 3107
```

In a third terminal:

```powershell
$env:E2E_BROWSER_CHANNEL = "chrome"
$env:E2E_SKIP_WEBSERVER = "true"
node_modules\.bin\playwright.cmd test
```

If browsers are missing:

```bash
pnpm exec playwright install
```

If the Playwright-managed browser is not installed but Chrome is available:

```powershell
$env:E2E_BROWSER_CHANNEL = "chrome"
node_modules\.bin\playwright.cmd test
```

Removal is simple if this test layer does not fit the team direction: delete `e2e/`, `playwright.config.ts`, and `.github/workflows/e2e.yml`.
