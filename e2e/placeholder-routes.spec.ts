import { expect, test } from "playwright/test";

const placeholderRoutes = [
  { path: "/catalog", heading: "Catalog" },
  { path: "/seller/listings", heading: "My Listings" },
  { path: "/wallet", heading: "Wallet" },
  { path: "/wallet/topup", heading: "Top Up Wallet" },
  { path: "/wallet/withdraw", heading: "Withdraw Balance" },
];

for (const route of placeholderRoutes) {
  test(`${route.path} renders its current placeholder page`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
  });
}
