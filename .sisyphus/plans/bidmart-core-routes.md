# Bidmart Core FE — Route Shells (Modules 2–5)

## TL;DR

> **Quick Summary**: Scaffold all frontend route shells for modules 2–5 of bidmart-core-fe — Catalog, Bidding, Wallet, and Orders/Notifications — following the exact pattern established in bidmart-auth-fe: thin route wrappers, typed mock payloads in `constant.ts`, and shadcn UI components with sonner toasts. No real API calls or backend logic.
>
> **Deliverables**:
>
> - `app/_app.tsx` — shared layout with header/navbar
> - 26 route files in `app/routes/`
> - 4 module `constant.ts` files with typed mock payloads
> - ~40 page + component files across 4 modules
> - 4 module `index.ts` barrel exports
> - Missing shadcn components installed upfront
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: T1 (setup) → T2 (layout) → T3–T6 (modules, parallel) → T7 (typecheck/build)

---

## Context

### Original Request

Implement route shells for modules 2–5 based on user stories, with mock payloads in `constant.ts`, shadcn UI, and sonner toaster. Reference: `bidmart-auth-fe` pages pattern.

### Interview Summary

**Key Discussions**:

- `constant.ts` location: **per-module** (`app/modules/{module}/presentation/pages/constant.ts`)
- Missing shadcn components: **install upfront** as Task 1
- Shared layout/navbar: **add `_app.tsx`** layout with header + nav links
- Auction countdown: **cosmetic frontend-only countdown timer** (no backend)
- Category path: **splat route** (`/c/*`) to support multi-segment paths
- Role handling: **`mockCurrentUser` with role field** in constants, render conditionally

**Research Findings**:

- Route file pattern: thin wrapper (`export default function XRoute() { return <XPage />; }`)
- Page component pattern: mock payload consumed in handler, toast on "submit", `useNavigate` to next route
- Splat param: `const { "*": categoryPath } = useParams()`
- `flatRoutes()` auto-discovers `app/routes/**` — no manual registration needed
- Layout route in React Router v7: file `_app.tsx` + child routes prefixed `_app.`

### Metis Review

**Identified Gaps** (addressed):

- Shared layout needed for inner pages — resolved by `_app.tsx` + `_app.` prefix on all new routes
- `constant.ts` DTO types need explicit interfaces — resolved by `satisfies` pattern from auth-fe
- splat route naming: `_app.c.$.tsx` (not `_app.c.$categoryPath.tsx`) — confirmed
- Buyer listing detail vs seller listing detail: separate pages, separate mock payloads

---

## Work Objectives

### Core Objective

Create all frontend route shells for modules 2–5 with typed mock payloads, shadcn UI, and toast feedback — no real backend calls.

### Concrete Deliverables

- `app/_app.tsx` layout with header/navbar (Catalog, My Bids, Wallet, Orders, Notifications, mock user role badge)
- `app/modules/catalog/presentation/` — 8 pages, components, constant.ts, index.ts
- `app/modules/bidding/presentation/` — 4 pages, components, constant.ts, index.ts
- `app/modules/wallet/presentation/` — 5 pages, components, constant.ts, index.ts
- `app/modules/orders/presentation/` — 9 pages, components, constant.ts, index.ts
- 26 route files in `app/routes/`

### Definition of Done

- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm build` exits 0
- [ ] All 26 routes render without crash (each navigated to via Playwright)

### Must Have

- All routes listed in scope have a working route file + page component
- Each module has a typed `constant.ts` with mock request + response shapes
- shadcn components used throughout (no raw HTML inputs/buttons)
- sonner `toast.success` / `toast.error` on all form submissions

### Must NOT Have (Guardrails)

- NO real API calls (`fetch`, `axios`, `useMutation` against real endpoints)
- NO authentication guards or role enforcement logic
- NO backend-specific logic (auction bid resolution, wallet balance calculation, etc.)
- NO new shadcn components installed mid-task (install ALL upfront in Task 1)
- NO shared `constant.ts` — each module must have its own
- NO deviation from `~/shared/components/ui/*` import path for shadcn
- NO raw `<input>`, `<button>`, `<select>` — use shadcn equivalents
- NO `console.log` left in production code

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision

- **Infrastructure exists**: YES (vitest configured)
- **Automated tests**: NONE for this task (UI scaffolding only — no logic to unit test)
- **Agent-Executed QA**: MANDATORY for every task

### QA Policy

Every task includes Playwright-based QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.png`.

- **Frontend/UI**: Playwright — navigate to route, assert key DOM content, screenshot

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — install + foundation):
└── Task 1: Install missing shadcn components + verify [quick]

Wave 2 (After Wave 1 — layout + type foundations):
├── Task 2: _app.tsx shared layout route [visual-engineering]
└── Task 3: All 4 module constant.ts files + DTO types [quick]

Wave 3 (After Wave 2 — module pages, MAX PARALLEL):
├── Task 4: Module 2 Catalog — Seller pages + components [visual-engineering]
├── Task 5: Module 2 Catalog — Buyer pages + components [visual-engineering]
├── Task 6: Module 3 Bidding — pages + components [visual-engineering]
├── Task 7: Module 4 Wallet — pages + components [visual-engineering]
└── Task 8: Module 5 Orders & Notifications — pages + components [visual-engineering]

Wave 4 (After Wave 3 — route files):
├── Task 9:  Module 2 route files (8 files) [quick]
├── Task 10: Module 3 route files (4 files) [quick]
├── Task 11: Module 4 route files (5 files) [quick]
└── Task 12: Module 5 route files (9 files) [quick]

Wave 5 (After Wave 4 — verification):
└── Task 13: TypeCheck + Build + Playwright smoke test [unspecified-high]

Critical Path: T1 → T2+T3 → T4–T8 (parallel) → T9–T12 (parallel) → T13
```

### Dependency Matrix

| Task | Depends On | Blocks |
| ---- | ---------- | ------ |
| T1   | —          | T2, T3 |
| T2   | T1         | T9–T12 |
| T3   | T1         | T4–T8  |
| T4   | T2, T3     | T9     |
| T5   | T2, T3     | T9     |
| T6   | T2, T3     | T10    |
| T7   | T2, T3     | T11    |
| T8   | T2, T3     | T12    |
| T9   | T4, T5     | T13    |
| T10  | T6         | T13    |
| T11  | T7         | T13    |
| T12  | T8         | T13    |
| T13  | T9–T12     | —      |

### Agent Dispatch Summary

- **Wave 1** (1 task): T1 → `quick`
- **Wave 2** (2 tasks): T2 → `visual-engineering`, T3 → `quick`
- **Wave 3** (5 tasks): T4–T8 → `visual-engineering` each
- **Wave 4** (4 tasks): T9–T12 → `quick` each
- **Wave 5** (1 task): T13 → `unspecified-high`

---

## TODOs

---

- [x] 1. Install missing shadcn components

  **What to do**:
  - Run: `pnpm dlx shadcn@latest add select tabs separator radio-group checkbox scroll-area dropdown-menu popover avatar`
  - Verify each component file exists under `app/shared/components/ui/`
  - Do NOT modify any existing component files

  **Must NOT do**:
  - Do NOT install components not listed above
  - Do NOT modify `components.json` manually (the CLI handles it)

  **Recommended Agent Profile**:
  > Simple CLI install — no design decisions needed.
  - **Category**: `quick`
    - Reason: Single command install, no code authoring required
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 — must complete before any other task
  - **Blocks**: All subsequent tasks (T2–T13)
  - **Blocked By**: None (start immediately)

  **References**:
  - `app/shared/components/ui/button.tsx` — verify new files land in the same directory
  - `components.json` — shadcn config, auto-updated by CLI

  **Acceptance Criteria**:
  - [ ] Files exist: `app/shared/components/ui/select.tsx`, `tabs.tsx`, `separator.tsx`, `radio-group.tsx`, `checkbox.tsx`, `scroll-area.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `avatar.tsx`
  - [ ] `pnpm typecheck` still exits 0 after install

  **QA Scenarios**:
  ```
  Scenario: All component files installed
    Tool: Bash
    Steps:
      1. Run: ls app/shared/components/ui/ | grep -E 'select|tabs|separator|radio-group|checkbox|scroll-area|dropdown-menu|popover|avatar'
      2. Assert: 9 filenames printed (one per component)
    Expected Result: All 9 component files present
    Failure Indicators: Missing file names in output
    Evidence: .sisyphus/evidence/task-1-components-installed.txt
  ```

  **Commit**: YES
  - Message: `chore(ui): install missing shadcn components`
  - Files: `app/shared/components/ui/*.tsx` (new files), `components.json`, `package.json`, `pnpm-lock.yaml`
  - Pre-commit: `pnpm typecheck`

- [x] 2. Add `_app.tsx` shared layout route

  **What to do**:
  - Create `app/routes/_app.tsx` — React Router v7 layout route that wraps all `_app.*` child routes
  - Layout includes: sticky header with app name + nav links (Catalog `/catalog`, My Bids `/me/bids`, Wallet `/wallet`, Orders `/orders`, Notifications `/notifications`) + a mock user badge (avatar + role label from `mockCurrentUser`)
  - Use `<Outlet />` from `react-router` to render child routes
  - Create `app/modules/layout/presentation/components/app-header.tsx` for the header component
  - `mockCurrentUser` = `{ id: 'user-1', name: 'Budi Santoso', role: 'buyer' as 'buyer' | 'seller' }` — define inline in the layout or in a `constant.ts` at `app/modules/layout/presentation/pages/constant.ts`
  - Use shadcn `Avatar`, `Badge`, `Button` components in the header
  - Active nav link highlighted (use `NavLink` from react-router with `className` callback)

  **Must NOT do**:
  - Do NOT add real auth checks or redirects
  - Do NOT fetch user data — use mock constant only
  - Do NOT add a sidebar — header only

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout design with nav, avatar, badges
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Crafting responsive header with active states

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: T4–T12 (all routes use this layout)
  - **Blocked By**: T1

  **References**:
  - `app/routes/login.tsx:1-5` — exact thin-wrapper route pattern
  - `app/root.tsx` — how providers wrap the app (for understanding structure, not to modify)
  - `app/shared/components/ui/avatar.tsx` — Avatar component API
  - `app/shared/components/ui/badge.tsx` — Badge component API
  - React Router v7 layout routes: a file named `_app.tsx` with `<Outlet />` makes all `_app.*` files render inside it

  **Acceptance Criteria**:
  - [ ] `app/routes/_app.tsx` exists and exports a default function with `<Outlet />`
  - [ ] Header renders with 5 nav links and a mock user badge
  - [ ] Active nav link has visual distinction (different className)

  **QA Scenarios**:
  ```
  Scenario: Layout renders on a child route
    Tool: Playwright
    Preconditions: Dev server running (pnpm dev)
    Steps:
      1. Navigate to /catalog
      2. Assert: header element exists with nav links
      3. Assert: text 'Catalog' visible in nav
      4. Assert: mock user name 'Budi Santoso' visible
      5. Screenshot full page
    Expected Result: Header with nav visible above page content
    Failure Indicators: Blank page, missing header, 404 error
    Evidence: .sisyphus/evidence/task-2-layout-header.png
  ```

  **Commit**: YES
  - Message: `feat(layout): add _app shared layout with navbar`
  - Files: `app/routes/_app.tsx`, `app/modules/layout/presentation/components/app-header.tsx`
  - Pre-commit: `pnpm typecheck`


- [x] 3. Create `constant.ts` mock payload files for all 4 modules

  **What to do**:
  Create typed mock payload constants for all 4 modules. Each file lives at `app/modules/{module}/presentation/pages/constant.ts`. Follow the exact pattern from `bidmart-auth-fe`: define local DTO interfaces inline, use `satisfies` for type safety, export a single named const.

  **`app/modules/catalog/presentation/pages/constant.ts`** — export `CATALOG_MOCK_PAYLOADS` with:
  - `createListing`: request `{ title, description, startingPrice, category, condition, imageUrl, auctionDuration }` / response `{ id, status: 'active' }`
  - `updateListing`: request `{ title, description, startingPrice }` / response `{ id, status: 'updated' }`
  - `cancelListing`: request `{ listingId, reason }` / response `{ success: true }`
  - `searchCatalog`: request `{ q, minPrice, maxPrice, endBefore, category, page }` / response `{ items: [{ id, title, currentBid, endsAt, imageUrl, category }], total, page }`
  - `getListingDetail`: request `{ listingId }` / response full listing object with seller info, current bid, bid count, status
  - `mockListings`: array of 3 mock listing objects (for panel display)
  - `mockCurrentUser`: `{ id: 'user-1', name: 'Budi Santoso', role: 'seller' as 'buyer' | 'seller' }`

  **`app/modules/bidding/presentation/pages/constant.ts`** — export `BIDDING_MOCK_PAYLOADS` with:
  - `placeBid`: request `{ auctionId, amount }` / response `{ bidId, status: 'accepted' | 'outbid', newHighestBid }`
  - `getAuctionDetail`: request `{ auctionId }` / response `{ id, title, currentBid, minIncrement, endsAt, bids: [...], status }`
  - `getBidHistory`: request `{ auctionId }` / response `{ bids: [{ bidId, bidderId, amount, placedAt, status }] }`
  - `getMyBids`: request `{ status?, page }` / response `{ bids: [{ auctionId, title, myBid, highestBid, status, endsAt }], total }`
  - `getBidDetail`: request `{ auctionId }` / response single auction detail with user's bid highlighted
  - `mockAuction`: single mock auction object for the detail page

  **`app/modules/wallet/presentation/pages/constant.ts`** — export `WALLET_MOCK_PAYLOADS` with:
  - `getWalletBalance`: response `{ balance: 2500000, currency: 'IDR', pendingBalance: 150000 }`
  - `topUp`: request `{ amount, paymentMethod: 'bank_transfer' | 'credit_card' | 'ewallet' }` / response `{ transactionId, status: 'pending', amount }`
  - `withdraw`: request `{ amount, bankAccount, bankName }` / response `{ transactionId, status: 'processing', amount }`
  - `getTransactions`: request `{ page, type? }` / response `{ transactions: [{ id, type, amount, status, createdAt, description }], total }`
  - `getTransactionDetail`: request `{ transactionId }` / response full transaction object
  - `mockTransactions`: array of 5 mock transactions with varying types/statuses

  **`app/modules/orders/presentation/pages/constant.ts`** — export `ORDERS_MOCK_PAYLOADS` with:
  - `getSellerOrders`: response `{ orders: [{ id, buyerName, listingTitle, amount, status, createdAt }], total }`
  - `getSellerOrderDetail`: response full order with buyer info, listing, payment, shipping status
  - `updateShipping`: request `{ orderId, courier, trackingNumber, estimatedDelivery }` / response `{ success: true }`
  - `getBuyerOrders`: response `{ orders: [{ id, sellerName, listingTitle, amount, status, createdAt }], total }`
  - `getBuyerOrderDetail`: response full order with seller info, listing, payment, shipping tracking
  - `confirmOrder`: request `{ orderId }` / response `{ success: true, newStatus: 'completed' }`
  - `createDispute`: request `{ orderId, reason: string, description: string }` / response `{ disputeId, status: 'open' }`
  - `getNotifications`: response `{ notifications: [{ id, type, title, message, isRead, createdAt }], unreadCount }`
  - `getNotificationDetail`: response `{ id, type, title, message, isRead, createdAt, relatedEntityId }`
  - `markNotificationRead`: request `{ notificationId }` / response `{ success: true }`
  - `mockOrders`: array of 3 mock orders
  - `mockNotifications`: array of 4 mock notifications with varying types

  **Must NOT do**:
  - Do NOT create a shared/global `constant.ts` — one per module only
  - Do NOT import from other modules' constants
  - Do NOT use `any` type — define inline interfaces for all DTO shapes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure TypeScript data definitions, no UI work
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: T4–T8 (all module pages consume these constants)
  - **Blocked By**: T1

  **References**:
  - `/home/kims/adpro/bidmart-auth-fe/app/modules/auth/presentation/pages/constant.ts` — **PRIMARY PATTERN**: exact structure, `satisfies` usage, inline interface pattern to replicate
  - `app/modules/auth/presentation/pages/constant.ts` — core-fe version (real hooks) to understand DTO shape conventions

  **Acceptance Criteria**:
  - [ ] 4 files created at correct paths
  - [ ] Each file exports a single named const (e.g., `CATALOG_MOCK_PAYLOADS`)
  - [ ] All DTO interfaces defined inline (no `any`)
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: TypeScript compilation succeeds on all constant files
    Tool: Bash
    Steps:
      1. Run: pnpm typecheck 2>&1
      2. Assert: exit code 0
      3. Assert: no error lines referencing constant.ts files
    Expected Result: Clean typecheck output
    Failure Indicators: Any TS error mentioning constant.ts
    Evidence: .sisyphus/evidence/task-3-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(mocks): add typed constant.ts for modules 2-5`
  - Files: `app/modules/catalog/presentation/pages/constant.ts`, `app/modules/bidding/presentation/pages/constant.ts`, `app/modules/wallet/presentation/pages/constant.ts`, `app/modules/orders/presentation/pages/constant.ts`
  - Pre-commit: `pnpm typecheck`

- [x] 4. Module 2 — Catalog Seller pages + components

  **What to do**:
  Create all Seller-side Catalog pages and their supporting form components. Seller role = managing their own listings.

  **Files to create**:
  - `app/modules/catalog/presentation/pages/listings-panel-page.tsx` — shows a table of seller's listings with status badges; uses `mockListings` from constant; each row links to detail
  - `app/modules/catalog/presentation/pages/new-listing-page.tsx` — form to create a listing; on submit: logs mock request, shows `toast.success('Listing created!')`, navigates to `/seller/listings`
  - `app/modules/catalog/presentation/pages/listing-detail-page.tsx` — seller view of a single listing; shows full detail from `mockListings[0]`; has Edit and Cancel buttons
  - `app/modules/catalog/presentation/pages/listing-edit-page.tsx` — pre-filled form from mock; on submit: `toast.success('Listing updated!')`, navigate back to detail
  - `app/modules/catalog/presentation/pages/listing-cancel-page.tsx` — confirmation dialog + reason field; on confirm: `toast.success('Listing cancelled')`, navigate to `/seller/listings`
  - `app/modules/catalog/presentation/components/listing-form.tsx` — shared form used by new + edit pages; fields: title (Input), description (Textarea), startingPrice (Input type=number), category (Select), condition (Select: new/like-new/used), imageUrl (Input), auctionDuration (Select: 1d/3d/7d); uses react-hook-form + zod
  - `app/modules/catalog/presentation/components/listing-table.tsx` — Table component displaying listing rows with Badge for status
  - `app/modules/catalog/presentation/components/cancel-listing-form.tsx` — reason Textarea + confirm Button
  - `app/modules/catalog/presentation/index.ts` — barrel export (if not already existing)

  **Page card wrapper**: Use the same card pattern as auth-fe: a centered Card with CardHeader (title) and CardContent.

  **Must NOT do**:
  - Do NOT implement real form submission (no `fetch`/`useMutation`)
  - Do NOT add pagination logic — just display the mock array
  - Do NOT add image upload — imageUrl is a plain text Input

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multiple UI pages with forms, tables, status badges
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form layout, card patterns, table design

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T7, T8)
  - **Parallel Group**: Wave 3
  - **Blocks**: T9 (catalog route files need these pages)
  - **Blocked By**: T2 (layout exists), T3 (constant.ts exists)

  **References**:
  - `/home/kims/adpro/bidmart-auth-fe/app/modules/auth/presentation/pages/login-page.tsx` — **PAGE PATTERN**: mock payload usage, navigate-on-submit, toast call
  - `/home/kims/adpro/bidmart-auth-fe/app/modules/auth/presentation/components/login-form.tsx` — **FORM PATTERN**: react-hook-form + zod + shadcn Form components structure
  - `/home/kims/adpro/bidmart-auth-fe/app/modules/auth/presentation/components/auth-card.tsx` — **CARD WRAPPER PATTERN**
  - `app/shared/components/ui/table.tsx` — Table/TableRow/TableCell API
  - `app/shared/components/ui/badge.tsx` — Badge variants for listing status
  - `app/shared/components/ui/select.tsx` — Select/SelectTrigger/SelectContent/SelectItem API (newly installed)
  - `app/modules/catalog/presentation/pages/constant.ts` — `CATALOG_MOCK_PAYLOADS.mockListings`, `createListing`, `updateListing`, `cancelListing`

  **Acceptance Criteria**:
  - [ ] All 5 page files + 3 component files + index.ts created
  - [ ] `pnpm typecheck` exits 0
  - [ ] New listing form has all 7 fields with correct shadcn components

  **QA Scenarios**:
  ```
  Scenario: Seller listings panel renders
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /seller/listings
      2. Assert: page title 'My Listings' visible
      3. Assert: at least 1 table row visible (from mock data)
      4. Assert: status Badge visible in first row
      5. Screenshot
    Expected Result: Table with mock listings displayed
    Failure Indicators: Blank page, JS error in console, no table rows
    Evidence: .sisyphus/evidence/task-4-seller-listings.png

  Scenario: New listing form renders all fields
    Tool: Playwright
    Steps:
      1. Navigate to /seller/listings/new
      2. Assert: input[name='title'] exists
      3. Assert: textarea[name='description'] exists
      4. Assert: select for category visible
      5. Screenshot
    Expected Result: All form fields rendered
    Failure Indicators: Missing fields, unstyled raw inputs
    Evidence: .sisyphus/evidence/task-4-new-listing-form.png
  ```

  **Commit**: YES
  - Message: `feat(catalog): seller listing pages and components`
  - Files: `app/modules/catalog/presentation/pages/*.tsx`, `app/modules/catalog/presentation/components/*.tsx`, `app/modules/catalog/presentation/index.ts`
  - Pre-commit: `pnpm typecheck`

- [x] 5. Module 2 — Catalog Buyer pages + components

  **What to do**:
  Create all Buyer-side Catalog pages. Buyer role = browsing and viewing listings.

  **Files to create**:
  - `app/modules/catalog/presentation/pages/catalog-panel-page.tsx` — search results page; shows a grid/list of listing cards from `mockListings`; includes a search filter bar (q, minPrice, maxPrice inputs + a Select for category); uses `useSearchParams` to read current filters; on filter change: update URL params (no real API call)
  - `app/modules/catalog/presentation/pages/category-page.tsx` — category browse page; reads `const { '*': categoryPath } = useParams()`; displays categoryPath as breadcrumb; shows same mock listing grid
  - `app/modules/catalog/presentation/pages/buyer-listing-detail-page.tsx` — buyer view of listing; shows listing detail from `mockListings[0]`; has a 'Place Bid' button linking to `/auctions/:auctionId`
  - `app/modules/catalog/presentation/components/listing-card.tsx` — Card component for a single listing in grid; shows image placeholder, title, currentBid, endsAt with a countdown-style display, category Badge
  - `app/modules/catalog/presentation/components/search-filter-bar.tsx` — horizontal filter bar with q Input, minPrice/maxPrice Inputs, category Select, a Search Button

  **Must NOT do**:
  - Do NOT implement real search/filter logic — display mock data regardless of filter values
  - Do NOT add pagination logic — just show mock array

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Grid layout, filter bar, listing cards, breadcrumb display
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Card grid, responsive filter bar

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T4, T6, T7, T8)
  - **Parallel Group**: Wave 3
  - **Blocks**: T9
  - **Blocked By**: T2, T3

  **References**:
  - `app/modules/catalog/presentation/components/listing-form.tsx` (from T4) — already established Select/Input patterns to stay consistent
  - `app/shared/components/ui/card.tsx` — Card/CardContent/CardFooter for listing cards
  - `app/shared/components/ui/badge.tsx` — category badge
  - `app/modules/catalog/presentation/pages/constant.ts` — `mockListings`, `searchCatalog`, `getListingDetail`
  - React Router `useSearchParams` hook for reading URL query params (import from `react-router`)
  - React Router `useParams` hook for reading `:categoryPath` (splat param key is `'*'`)

  **Acceptance Criteria**:
  - [ ] Catalog panel shows listing grid from mock data
  - [ ] Category page reads and displays `categoryPath` from URL
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Catalog page shows mock listings
    Tool: Playwright
    Steps:
      1. Navigate to /catalog
      2. Assert: search filter bar visible (input with placeholder or label containing 'Search')
      3. Assert: at least 1 listing card visible
      4. Screenshot
    Expected Result: Grid of listing cards with filter bar
    Failure Indicators: Empty page, no cards
    Evidence: .sisyphus/evidence/task-5-catalog-panel.png

  Scenario: Category page shows category path
    Tool: Playwright
    Steps:
      1. Navigate to /c/electronics/phones
      2. Assert: text 'electronics/phones' visible on page
      3. Screenshot
    Expected Result: Category path displayed as breadcrumb/title
    Failure Indicators: 404, blank page, missing category display
    Evidence: .sisyphus/evidence/task-5-category-page.png
  ```

  **Commit**: YES (grouped with T4)
  - Message: `feat(catalog): buyer catalog pages and components`
  - Files: `app/modules/catalog/presentation/pages/catalog-panel-page.tsx`, `category-page.tsx`, `buyer-listing-detail-page.tsx`, `app/modules/catalog/presentation/components/listing-card.tsx`, `search-filter-bar.tsx`
  - Pre-commit: `pnpm typecheck`

- [x] 6. Module 3 — Bidding pages + components

  **What to do**:
  Create all Bidding module pages. This module is used by buyers to participate in auctions.

  **Files to create**:
  - `app/modules/bidding/presentation/pages/auction-page.tsx` — the main auction view; displays current bid from `mockAuction`, a cosmetic live countdown timer (use `setInterval` in `useEffect` counting down from `mockAuction.endsAt`), a 'Place Bid' form (amount Input + Submit Button); on submit: `toast.success('Bid placed!')`, void the mock request; also link to bid history
  - `app/modules/bidding/presentation/pages/auction-history-page.tsx` — list of all bids for an auction; table with columns: bidder (anonymized as 'Bidder #N'), amount, placed at, status Badge; data from `getBidHistory.response.bids`
  - `app/modules/bidding/presentation/pages/my-bids-page.tsx` — buyer's personal bidding history; shows `getMyBids.response.bids` as a table or card list; each row shows auction title, myBid, highestBid, status Badge (winning/outbid/won/lost), endsAt; has a Tabs component with status filter tabs (All, Winning, Outbid, Won, Lost)
  - `app/modules/bidding/presentation/pages/bid-detail-page.tsx` — single auction detail from buyer's bid perspective; shows `getBidDetail.response`, highlights the user's bid vs current highest
  - `app/modules/bidding/presentation/components/bid-form.tsx` — amount Input with min value hint (currentBid + minIncrement), Submit Button; react-hook-form + zod (amount must be > currentBid)
  - `app/modules/bidding/presentation/components/countdown-timer.tsx` — displays time remaining as `Xh Ym Zs`; accepts `endsAt: string` prop; uses `useEffect` + `setInterval` to update every second; purely cosmetic (stops at 0:0:0)
  - `app/modules/bidding/presentation/index.ts` — barrel export

  **Must NOT do**:
  - Do NOT use WebSockets or real-time data
  - Do NOT implement bid validation against real auction state
  - Do NOT show real bidder identities — anonymize as 'Bidder #1', 'Bidder #2'

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Live countdown timer component, bid form, status tabs
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Countdown display, tab navigation, bid status badges

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T4, T5, T7, T8)
  - **Parallel Group**: Wave 3
  - **Blocks**: T10 (bidding route files)
  - **Blocked By**: T2, T3

  **References**:
  - `/home/kims/adpro/bidmart-auth-fe/app/modules/auth/presentation/pages/login-page.tsx` — mock submit + toast pattern
  - `app/shared/components/ui/tabs.tsx` — Tabs/TabsList/TabsTrigger/TabsContent API (newly installed)
  - `app/shared/components/ui/badge.tsx` — bid status badges
  - `app/modules/bidding/presentation/pages/constant.ts` — `mockAuction`, `placeBid`, `getBidHistory`, `getMyBids`, `getBidDetail`
  - React `useEffect` + `setInterval` for countdown timer

  **Acceptance Criteria**:
  - [ ] Auction page shows countdown timer updating every second
  - [ ] My Bids page has Tabs with status filters
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Auction page shows countdown and bid form
    Tool: Playwright
    Steps:
      1. Navigate to /auctions/auction-1
      2. Assert: text matching /\d+h \d+m \d+s/ visible (countdown)
      3. Assert: input for bid amount exists
      4. Assert: button 'Place Bid' visible
      5. Screenshot
    Expected Result: Auction detail with live countdown and bid form
    Failure Indicators: No countdown, no bid form, blank page
    Evidence: .sisyphus/evidence/task-6-auction-page.png

  Scenario: My Bids page shows tabs
    Tool: Playwright
    Steps:
      1. Navigate to /me/bids
      2. Assert: tab 'All' visible and selected
      3. Assert: tab 'Winning' visible
      4. Assert: at least 1 bid row visible
      5. Screenshot
    Expected Result: Tabbed bid list with mock data
    Failure Indicators: No tabs, blank list
    Evidence: .sisyphus/evidence/task-6-my-bids.png
  ```

  **Commit**: YES
  - Message: `feat(bidding): auction and bid history pages`
  - Files: `app/modules/bidding/presentation/pages/*.tsx`, `app/modules/bidding/presentation/components/*.tsx`, `app/modules/bidding/presentation/index.ts`
  - Pre-commit: `pnpm typecheck`

- [x] 7. Module 4 — Wallet pages + components

  **What to do**:
  Create all Wallet module pages for balance management, top-up, withdrawal, and transaction history.

  **Files to create**:
  - `app/modules/wallet/presentation/pages/wallet-page.tsx` — wallet dashboard; shows balance from `getWalletBalance.response` in a prominent Card (`Rp 2.500.000`); pendingBalance shown as secondary; two action Buttons: 'Top Up' (link to `/wallet/topup`) and 'Withdraw' (link to `/wallet/withdraw`); link to 'Transaction History'
  - `app/modules/wallet/presentation/pages/topup-page.tsx` — top-up form; amount Input; payment method using RadioGroup (Bank Transfer, Credit Card, E-Wallet options); on submit: `toast.success('Top up request submitted!')`, void mock request, navigate to `/wallet`
  - `app/modules/wallet/presentation/pages/withdraw-page.tsx` — withdrawal form; amount Input; bankAccount Input; bankName Select (BCA, BNI, BRI, Mandiri, etc.); validation: amount must be > 0 and <= mockBalance; on submit: `toast.success('Withdrawal request submitted!')`, navigate to `/wallet`
  - `app/modules/wallet/presentation/pages/transactions-page.tsx` — transaction history list; shows `mockTransactions` as a Table; columns: date, description, type Badge (topup/withdraw/payment), amount (colored green/red), status Badge; has Tabs for type filter (All, Top Up, Withdraw, Payment)
  - `app/modules/wallet/presentation/pages/transaction-detail-page.tsx` — single transaction; reads `useParams().transactionId`; shows `getTransactionDetail.response` in a detail card
  - `app/modules/wallet/presentation/components/topup-form.tsx` — react-hook-form + zod; RadioGroup for payment method + amount Input
  - `app/modules/wallet/presentation/components/withdraw-form.tsx` — react-hook-form + zod; amount Input + bankAccount Input + bankName Select
  - `app/modules/wallet/presentation/index.ts` — barrel export

  **Must NOT do**:
  - Do NOT validate amount against real balance (use mock constant value only)
  - Do NOT implement payment gateway flows
  - Do NOT use Slider for amount — plain Input type=number only

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Financial UI with RadioGroup, Tabs, colored amounts
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Balance display, payment method selection, transaction table design

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T4, T5, T6, T8)
  - **Parallel Group**: Wave 3
  - **Blocks**: T11 (wallet route files)
  - **Blocked By**: T2, T3

  **References**:
  - `/home/kims/adpro/bidmart-auth-fe/app/modules/auth/presentation/components/login-form.tsx` — form structure with react-hook-form + zod
  - `app/shared/components/ui/radio-group.tsx` — RadioGroup/RadioGroupItem API (newly installed)
  - `app/shared/components/ui/tabs.tsx` — Tabs for transaction type filter
  - `app/shared/components/ui/select.tsx` — bank name Select
  - `app/modules/wallet/presentation/pages/constant.ts` — `getWalletBalance`, `topUp`, `withdraw`, `getTransactions`, `mockTransactions`

  **Acceptance Criteria**:
  - [ ] Wallet page shows balance from mock (Rp 2.500.000)
  - [ ] Top-up form has RadioGroup with 3 payment method options
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Wallet dashboard shows balance
    Tool: Playwright
    Steps:
      1. Navigate to /wallet
      2. Assert: text containing '2.500.000' or '2500000' visible
      3. Assert: button or link 'Top Up' visible
      4. Assert: button or link 'Withdraw' visible
      5. Screenshot
    Expected Result: Balance displayed with action buttons
    Failure Indicators: No balance shown, buttons missing
    Evidence: .sisyphus/evidence/task-7-wallet-dashboard.png

  Scenario: Top-up form has payment method selection
    Tool: Playwright
    Steps:
      1. Navigate to /wallet/topup
      2. Assert: radio option 'Bank Transfer' visible
      3. Assert: radio option 'E-Wallet' visible
      4. Assert: input for amount exists
      5. Screenshot
    Expected Result: Top-up form with RadioGroup and amount field
    Failure Indicators: No radio buttons, missing amount field
    Evidence: .sisyphus/evidence/task-7-topup-form.png
  ```

  **Commit**: YES
  - Message: `feat(wallet): wallet and transaction pages`
  - Files: `app/modules/wallet/presentation/pages/*.tsx`, `app/modules/wallet/presentation/components/*.tsx`, `app/modules/wallet/presentation/index.ts`
  - Pre-commit: `pnpm typecheck`

- [x] 8. Module 5 — Orders & Notifications pages + components

  **What to do**:
  Create all Orders and Notifications pages. Module 5 covers: seller order management, buyer order tracking, and notification inbox.

  **Files to create**:
  - `app/modules/orders/presentation/pages/notifications-page.tsx` — notification inbox; shows `mockNotifications` as a list; each item shows type icon/badge, title, message preview, isRead indicator (unread items bold), createdAt; clicking an item navigates to `/notifications/:notificationId`
  - `app/modules/orders/presentation/pages/notification-detail-page.tsx` — full notification; reads `useParams().notificationId`; shows `getNotificationDetail.response` in a Card; 'Mark as Read' button calls `toast.success('Marked as read')` and voids `markNotificationRead.request`
  - `app/modules/orders/presentation/pages/seller-orders-page.tsx` — seller's order panel; Table with columns: order ID, buyer name, listing title, amount, status Badge, date; data from `getSellerOrders.response.orders`
  - `app/modules/orders/presentation/pages/seller-order-detail-page.tsx` — full seller order view; reads `useParams().orderId`; shows order detail from `getSellerOrderDetail.response`; 'Update Shipping' button links to `/seller/orders/:orderId/shipping`
  - `app/modules/orders/presentation/pages/shipping-update-page.tsx` — shipping update form; courier Input, trackingNumber Input, estimatedDelivery Input (type=date); on submit: `toast.success('Shipping updated!')`, navigate to `/seller/orders/:orderId`
  - `app/modules/orders/presentation/pages/buyer-orders-page.tsx` — buyer's order list; same Table structure as seller but with seller name column; data from `getBuyerOrders.response.orders`
  - `app/modules/orders/presentation/pages/buyer-order-detail-page.tsx` — buyer's order detail; shows `getBuyerOrderDetail.response`; two action buttons: 'Confirm Receipt' (links to confirm page) and 'Open Dispute' (links to dispute page)
  - `app/modules/orders/presentation/pages/order-confirm-page.tsx` — confirmation dialog page; shows order summary; Confirm button calls `toast.success('Order confirmed!')`, voids `confirmOrder.request`, navigates to `/orders`
  - `app/modules/orders/presentation/pages/order-dispute-page.tsx` — dispute form; reason Select (Item not received / Item not as described / Payment issue / Other) + description Textarea; on submit: `toast.success('Dispute submitted!')`, voids `createDispute.request`, navigates to `/orders/:orderId`
  - `app/modules/orders/presentation/components/order-table.tsx` — reusable Table for seller/buyer order lists
  - `app/modules/orders/presentation/components/shipping-form.tsx` — react-hook-form + zod
  - `app/modules/orders/presentation/components/dispute-form.tsx` — reason Select + description Textarea, react-hook-form + zod
  - `app/modules/orders/presentation/components/notification-list.tsx` — list of notification items with read/unread styling
  - `app/modules/orders/presentation/index.ts` — barrel export

  **Must NOT do**:
  - Do NOT implement real-time notification polling
  - Do NOT implement actual payment or order state machine
  - Do NOT show real buyer/seller PII beyond mock data

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multiple list/detail pages, dispute form with Select, notification read states
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Notification UX, order status flows, form design

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T4, T5, T6, T7)
  - **Parallel Group**: Wave 3
  - **Blocks**: T12 (orders route files)
  - **Blocked By**: T2, T3

  **References**:
  - `/home/kims/adpro/bidmart-auth-fe/app/modules/auth/presentation/pages/login-page.tsx` — mock submit + toast + navigate pattern
  - `app/shared/components/ui/select.tsx` — Select for dispute reason and bank name
  - `app/shared/components/ui/table.tsx` — order table structure
  - `app/shared/components/ui/badge.tsx` — order status Badge
  - `app/modules/orders/presentation/pages/constant.ts` — all mock payloads

  **Acceptance Criteria**:
  - [ ] All 9 page files + 4 component files + index.ts created
  - [ ] Dispute form has reason Select + description Textarea
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Notifications page shows mock notifications
    Tool: Playwright
    Steps:
      1. Navigate to /notifications
      2. Assert: at least 1 notification item visible
      3. Assert: unread count badge or bold text visible
      4. Screenshot
    Expected Result: Notification list with read/unread styling
    Failure Indicators: Blank list, no items
    Evidence: .sisyphus/evidence/task-8-notifications.png

  Scenario: Dispute form renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to /orders/order-1/dispute/new
      2. Assert: Select for reason visible with option 'Item not received'
      3. Assert: Textarea for description visible
      4. Assert: Submit button visible
      5. Screenshot
    Expected Result: Dispute form with reason Select and description Textarea
    Failure Indicators: Missing Select, raw select element, missing textarea
    Evidence: .sisyphus/evidence/task-8-dispute-form.png
  ```

  **Commit**: YES
  - Message: `feat(orders): orders and notifications pages`
  - Files: `app/modules/orders/presentation/pages/*.tsx`, `app/modules/orders/presentation/components/*.tsx`, `app/modules/orders/presentation/index.ts`
  - Pre-commit: `pnpm typecheck`

- [x] 9. Module 2 — Catalog route files (8 files)

  **What to do**:
  Create 8 thin route wrapper files in `app/routes/` for the catalog module. Each file has exactly the same structure: import the page component, export a default function that returns `<PageComponent />`.

  **Files to create**:
  - `app/routes/_app.seller.listings.tsx` — `import { ListingsPanelPage } from '~/modules/catalog/presentation'`
  - `app/routes/_app.seller.listings.new.tsx` — `import { NewListingPage }`
  - `app/routes/_app.seller.listings.$listingId.tsx` — `import { ListingDetailPage }`
  - `app/routes/_app.seller.listings.$listingId.edit.tsx` — `import { ListingEditPage }`
  - `app/routes/_app.seller.listings.$listingId.cancel.tsx` — `import { ListingCancelPage }`
  - `app/routes/_app.catalog.tsx` — `import { CatalogPanelPage }`
  - `app/routes/_app.c.$.tsx` — `import { CategoryPage }` (splat route)
  - `app/routes/_app.listings.$listingId.tsx` — `import { BuyerListingDetailPage }`

  **Import source**: from `~/modules/catalog/presentation` (barrel exports from index.ts)

  **Must NOT do**:
  - Do NOT add any logic to route files — thin wrappers only
  - Do NOT add `loader` or `action` functions
  - Do NOT modify any existing route files (`_index.tsx`, `login.tsx`, etc.)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Repetitive thin wrapper files, no design decisions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T10, T11, T12)
  - **Parallel Group**: Wave 4
  - **Blocks**: T13
  - **Blocked By**: T4, T5 (page components must exist before routes import them)

  **References**:
  - `app/routes/login.tsx` — **EXACT PATTERN** to replicate for each route
  - `app/modules/catalog/presentation/index.ts` — barrel export source (created in T4/T5)

  **Acceptance Criteria**:
  - [ ] All 8 route files exist in `app/routes/`
  - [ ] Each file imports from `~/modules/catalog/presentation`
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: All catalog routes resolve without 404
    Tool: Playwright
    Steps:
      1. Navigate to /seller/listings — assert: no '404' or 'Cannot GET' text
      2. Navigate to /seller/listings/new — assert: form visible
      3. Navigate to /seller/listings/listing-1 — assert: detail content visible
      4. Navigate to /catalog — assert: search bar visible
      5. Navigate to /c/electronics — assert: category name visible
    Expected Result: All 5 tested routes render page content
    Failure Indicators: Any 404 response, blank page, JS error
    Evidence: .sisyphus/evidence/task-9-routes-smoke.png
  ```

  **Commit**: YES (grouped with T10–T12)
  - Message: `feat(routes): add route files for modules 2-5`
  - Files: `app/routes/_app.seller.listings.tsx`, `_app.seller.listings.new.tsx`, `_app.seller.listings.$listingId.tsx`, `_app.seller.listings.$listingId.edit.tsx`, `_app.seller.listings.$listingId.cancel.tsx`, `_app.catalog.tsx`, `_app.c.$.tsx`, `_app.listings.$listingId.tsx`
  - Pre-commit: `pnpm typecheck`

- [x] 10. Module 3 — Bidding route files (4 files)

  **What to do**:
  Create 4 thin route wrapper files for the bidding module.

  **Files to create**:
  - `app/routes/_app.auctions.$auctionId.tsx` — `import { AuctionPage }`
  - `app/routes/_app.auctions.$auctionId.history.tsx` — `import { AuctionHistoryPage }`
  - `app/routes/_app.me.bids.tsx` — `import { MyBidsPage }`
  - `app/routes/_app.me.bids.$auctionId.tsx` — `import { BidDetailPage }`

  **Import source**: from `~/modules/bidding/presentation`

  **Must NOT do**:
  - Same as T9: thin wrappers only, no `loader`/`action`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T11, T12)
  - **Parallel Group**: Wave 4
  - **Blocks**: T13
  - **Blocked By**: T6

  **References**:
  - `app/routes/login.tsx` — thin wrapper pattern
  - `app/modules/bidding/presentation/index.ts` — barrel (from T6)

  **Acceptance Criteria**:
  - [ ] All 4 route files exist
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Bidding routes resolve
    Tool: Playwright
    Steps:
      1. Navigate to /auctions/auction-1 — assert: countdown timer visible
      2. Navigate to /me/bids — assert: tabs visible
    Expected Result: Both routes render
    Failure Indicators: 404 or blank page
    Evidence: .sisyphus/evidence/task-10-bidding-routes.png
  ```

  **Commit**: YES (grouped with T9, T11, T12)
  - Message: (see T9 commit — grouped)
  - Files: `app/routes/_app.auctions.$auctionId.tsx`, `_app.auctions.$auctionId.history.tsx`, `_app.me.bids.tsx`, `_app.me.bids.$auctionId.tsx`
  - Pre-commit: `pnpm typecheck`

- [x] 11. Module 4 — Wallet route files (5 files)

  **What to do**:
  Create 5 thin route wrapper files for the wallet module.

  **Files to create**:
  - `app/routes/_app.wallet.tsx` — `import { WalletPage }`
  - `app/routes/_app.wallet.topup.tsx` — `import { TopupPage }`
  - `app/routes/_app.wallet.withdraw.tsx` — `import { WithdrawPage }`
  - `app/routes/_app.wallet.transactions.tsx` — `import { TransactionsPage }`
  - `app/routes/_app.wallet.transactions.$transactionId.tsx` — `import { TransactionDetailPage }`

  **Import source**: from `~/modules/wallet/presentation`

  **Must NOT do**: Same as T9/T10.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10, T12)
  - **Parallel Group**: Wave 4
  - **Blocks**: T13
  - **Blocked By**: T7

  **References**:
  - `app/routes/login.tsx` — thin wrapper pattern
  - `app/modules/wallet/presentation/index.ts` — barrel (from T7)

  **Acceptance Criteria**:
  - [ ] All 5 route files exist
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Wallet routes resolve
    Tool: Playwright
    Steps:
      1. Navigate to /wallet — assert: balance amount visible
      2. Navigate to /wallet/topup — assert: RadioGroup visible
      3. Navigate to /wallet/transactions — assert: table visible
    Expected Result: All 3 routes render correctly
    Failure Indicators: 404 or blank page
    Evidence: .sisyphus/evidence/task-11-wallet-routes.png
  ```

  **Commit**: YES (grouped with T9, T10, T12)
  - Message: (see T9 commit — grouped)
  - Files: `app/routes/_app.wallet.tsx`, `_app.wallet.topup.tsx`, `_app.wallet.withdraw.tsx`, `_app.wallet.transactions.tsx`, `_app.wallet.transactions.$transactionId.tsx`
  - Pre-commit: `pnpm typecheck`

- [x] 12. Module 5 — Orders & Notifications route files (9 files)

  **What to do**:
  Create 9 thin route wrapper files for the orders and notifications module.

  **Files to create**:
  - `app/routes/_app.notifications.tsx` — `import { NotificationsPage }`
  - `app/routes/_app.notifications.$notificationId.tsx` — `import { NotificationDetailPage }`
  - `app/routes/_app.seller.orders.tsx` — `import { SellerOrdersPage }`
  - `app/routes/_app.seller.orders.$orderId.tsx` — `import { SellerOrderDetailPage }`
  - `app/routes/_app.seller.orders.$orderId.shipping.tsx` — `import { ShippingUpdatePage }`
  - `app/routes/_app.orders.tsx` — `import { BuyerOrdersPage }`
  - `app/routes/_app.orders.$orderId.tsx` — `import { BuyerOrderDetailPage }`
  - `app/routes/_app.orders.$orderId.confirm.tsx` — `import { OrderConfirmPage }`
  - `app/routes/_app.orders.$orderId.dispute.new.tsx` — `import { OrderDisputePage }`

  **Import source**: from `~/modules/orders/presentation`

  **Must NOT do**: Same as T9/T10/T11.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10, T11)
  - **Parallel Group**: Wave 4
  - **Blocks**: T13
  - **Blocked By**: T8

  **References**:
  - `app/routes/login.tsx` — thin wrapper pattern
  - `app/modules/orders/presentation/index.ts` — barrel (from T8)

  **Acceptance Criteria**:
  - [ ] All 9 route files exist
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Orders and notifications routes resolve
    Tool: Playwright
    Steps:
      1. Navigate to /notifications — assert: notification list visible
      2. Navigate to /seller/orders — assert: table visible
      3. Navigate to /orders — assert: order list visible
      4. Navigate to /orders/order-1/dispute/new — assert: dispute form visible
    Expected Result: All 4 tested routes render
    Failure Indicators: 404 or blank page
    Evidence: .sisyphus/evidence/task-12-orders-routes.png
  ```

  **Commit**: YES (grouped with T9, T10, T11)
  - Message: `feat(routes): add route files for modules 2-5`
  - Files: all 9 route files listed above
  - Pre-commit: `pnpm typecheck`

- [x] 13. TypeCheck + Build + Playwright smoke test (full verification)

  **What to do**:
  Final integration check after all implementation tasks are complete.

  - Run `pnpm typecheck` — must exit 0 with no errors
  - Run `pnpm build` — must exit 0 with build artifacts
  - Start dev server: `pnpm dev &` (background)
  - Run Playwright smoke test across all 26 routes: navigate to each, screenshot, assert no 404/error boundary
  - Stop dev server after tests
  - If any check fails: fix the issue (do not skip) and re-run

  **Complete route list for smoke test**:
  `/seller/listings`, `/seller/listings/new`, `/seller/listings/listing-1`, `/seller/listings/listing-1/edit`, `/seller/listings/listing-1/cancel`, `/catalog`, `/c/electronics`, `/listings/listing-1`, `/auctions/auction-1`, `/auctions/auction-1/history`, `/me/bids`, `/me/bids/auction-1`, `/wallet`, `/wallet/topup`, `/wallet/withdraw`, `/wallet/transactions`, `/wallet/transactions/tx-1`, `/notifications`, `/notifications/notif-1`, `/seller/orders`, `/seller/orders/order-1`, `/seller/orders/order-1/shipping`, `/orders`, `/orders/order-1`, `/orders/order-1/confirm`, `/orders/order-1/dispute/new`

  **Must NOT do**:
  - Do NOT skip any route in the smoke test
  - Do NOT mark task complete if typecheck or build fails

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires running multiple commands, interpreting errors, fixing issues, and running Playwright
  - **Skills**: [`playwright`]
    - `playwright`: Browser-based smoke testing of all 26 routes

  **Parallelization**:
  - **Can Run In Parallel**: NO — must run after ALL route files are created
  - **Parallel Group**: Wave 5 (final)
  - **Blocks**: Nothing (final task)
  - **Blocked By**: T9, T10, T11, T12

  **References**:
  - `package.json` scripts section — exact `typecheck` and `build` command names
  - All route files in `app/routes/_app.*.tsx` — full route list

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck` exits 0
  - [ ] `pnpm build` exits 0
  - [ ] All 26 routes return HTTP 200 (no 404/500)
  - [ ] All 26 screenshots captured with visible page content

  **QA Scenarios**:
  ```
  Scenario: Full build succeeds
    Tool: Bash
    Steps:
      1. Run: pnpm typecheck 2>&1; echo "exit:$?"
      2. Assert: output contains 'exit:0'
      3. Run: pnpm build 2>&1; echo "exit:$?"
      4. Assert: output contains 'exit:0'
    Expected Result: Clean typecheck and build
    Failure Indicators: Any TypeScript error, build error
    Evidence: .sisyphus/evidence/task-13-build-output.txt

  Scenario: All 26 routes render (smoke test)
    Tool: Playwright
    Steps:
      1. For each route in the list above: navigate + screenshot + assert no error boundary
      2. Assert: none of the screenshots show '404', 'Cannot GET', or React error boundary
    Expected Result: All 26 routes render with content
    Failure Indicators: Any 404, blank page, or error boundary in any screenshot
    Evidence: .sisyphus/evidence/task-13-smoke-all-routes/ (26 screenshots)
  ```

  **Commit**: NO (verification only)

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Run `pnpm typecheck` + `pnpm build`. Check all new files for: `as any`, `@ts-ignore`, empty catches, `console.log`, raw HTML form elements, missing toast feedback. Flag violations with file:line.
      Output: `TypeCheck [PASS/FAIL] | Build [PASS/FAIL] | Issues [N] | VERDICT`

---

## Commit Strategy

- **T1**: `chore(ui): install missing shadcn components` — `components.json`, `package.json`, `pnpm-lock.yaml`, installed ui files
- **T2**: `feat(layout): add _app shared layout with navbar` — `app/_app.tsx`, `app/modules/shared-layout/`
- **T3**: `feat(mocks): add typed constant.ts for modules 2–5` — all 4 `constant.ts` files
- **T4**: `feat(catalog): seller listing pages and components` — catalog seller files
- **T5**: `feat(catalog): buyer catalog pages and components` — catalog buyer files
- **T6**: `feat(bidding): auction and bid history pages` — bidding module files
- **T7**: `feat(wallet): wallet and transaction pages` — wallet module files
- **T8**: `feat(orders): orders and notifications pages` — orders module files
- **T9–T12**: `feat(routes): add route files for modules 2–5` — all route files
- **T13**: No commit — verification only

---

## Success Criteria

### Verification Commands

```bash
pnpm typecheck   # Expected: exit 0, no errors
pnpm build       # Expected: exit 0, build artifacts in build/
```

### Final Checklist

- [ ] All 26 route files exist in `app/routes/`
- [ ] All 4 `constant.ts` files exist with typed mock payloads
- [ ] All page components use shadcn components exclusively
- [ ] All forms call `toast.success` / `toast.error` on submit
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
