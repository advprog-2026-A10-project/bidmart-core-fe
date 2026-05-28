import { expect, test } from "playwright/test";

test("my bids page renders and filter tabs update the query string", async ({ page }) => {
  await page.goto("/me/bids");

  await expect(page.getByRole("heading", { name: "My bids" })).toBeVisible();

  await page.getByRole("tab", { name: /Winning/ }).click();
  await expect(page).toHaveURL(/status=winning/);
  await expect(page.getByRole("tab", { name: /Winning/ })).toHaveAttribute("data-state", "active");
});

test("auction detail and history pages render current mock auction surfaces", async ({ page }) => {
  await page.goto("/auctions/auction-1");

  await expect(page.getByText("English Auction", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Auction details", { exact: true })).toBeVisible();

  await page.goto("/auctions/auction-1/history");
  await expect(page.getByRole("heading", { name: "Auction bid history" })).toBeVisible();
});
