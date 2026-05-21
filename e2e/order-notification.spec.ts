import { expect, test } from "playwright/test";
import { notificationId, orderId } from "./fixtures/api";

test("orders page renders API-backed order and notification summaries", async ({ page }) => {
  await page.goto("/orders");

  await expect(page.getByRole("heading", { name: "Orders and notifications" })).toBeVisible();
  await expect(page.getByText("Banksy - Shredded Beauty", { exact: true })).toBeVisible();
  await expect(page.getByText("WinnerDetermined - Banksy - Shredded Beauty")).toBeVisible();
});

test("notifications page supports unread filter and mark-as-read action", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByText("OrderUpdate - Shipping prepared")).toBeVisible();

  await page.getByLabel("Unread only").click();

  await expect(page.getByText("WinnerDetermined - Banksy - Shredded Beauty")).toBeVisible();
  await expect(page.getByText("OrderUpdate - Shipping prepared")).toHaveCount(0);

  await page.getByRole("button", { name: "Mark read" }).click();
  await expect(page.getByText("Unable to mark notification as read.")).toHaveCount(0);
});

test("order and notification detail routes render with mocked backend contracts", async ({ page }) => {
  await page.goto(`/orders/${orderId}`);
  await expect(page.getByRole("heading", { name: "Banksy - Shredded Beauty" })).toBeVisible();

  await page.goto(`/notifications/${notificationId}`);
  await expect(
    page.getByRole("heading", { name: "WinnerDetermined - Banksy - Shredded Beauty" }),
  ).toBeVisible();
});
