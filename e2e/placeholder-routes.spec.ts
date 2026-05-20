import { expect, test } from "playwright/test";

const placeholderRoutes = [
  { path: "/catalog", heading: "Catalog" },
  { path: "/seller/listings", heading: "Listings" },
  { path: "/wallet", heading: "Wallet" },
  { path: "/wallet/topup", heading: "Wallet Topup" },
  { path: "/wallet/withdraw", heading: "Wallet Withdraw" },
];

for (const route of placeholderRoutes) {
  test(`${route.path} renders its current placeholder page`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
  });
}
