# BidMart Core FE E2E Tests

This folder is intentionally independent from the application code. It only adds browser-level smoke and UI flow checks for the current implemented frontend surface.

Current scope:

- order and notification pages with mocked API responses
- bidding pages that already use local mock payloads
- placeholder route smoke checks for unfinished catalog and wallet pages

Run locally from `bidmart-core-fe`:

```bash
pnpm exec playwright test
```

On Windows, if `pnpm` is not available but dependencies already exist:

```powershell
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
