import type { Page } from "playwright/test";

const now = "2026-05-20T10:00:00.000Z";

export const orderId = "11111111-1111-4111-8111-111111111111";
export const notificationId = "22222222-2222-4222-8222-222222222222";

const orders = [
  {
    id: orderId,
    lot: "Banksy - Shredded Beauty",
    stage: "active",
    status: "Awaiting Payment",
    buyerId: "buyer-vel",
    sellerId: "seller-adr",
    total: "$25,400,000",
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    tags: ["Escrow pending", "Anti-sniping"],
    lastActivity: "Just now",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    lot: "Banksy - Flower Thrower",
    stage: "processing",
    status: "In Transit",
    buyerId: "buyer-vel",
    sellerId: "seller-ddl",
    total: "$1,250,000",
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    tags: ["Courier: FedEx"],
    lastActivity: "6 minutes ago",
  },
];

const notifications = [
  {
    id: notificationId,
    orderId,
    title: "WinnerDetermined - Banksy - Shredded Beauty",
    body: "You won the auction and the order is ready for payment.",
    channel: "inbox",
    type: "WinnerDetermined",
    createdAt: now,
    readAt: null,
    metadata: { userId: "buyer-vel" },
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    orderId,
    title: "OrderUpdate - Shipping prepared",
    body: "The seller prepared the package for courier pickup.",
    channel: "email",
    type: "OrderUpdate",
    createdAt: now,
    readAt: now,
    metadata: { userId: "buyer-vel" },
  },
];

export async function mockOrderAndNotificationApi(page: Page) {
  await page.route("**/api/v1/orders?**", async (route) => {
    const url = new URL(route.request().url());
    const stage = url.searchParams.get("stage");
    const filtered = stage ? orders.filter((order) => order.stage === stage) : orders;

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ data: filtered, total: filtered.length }),
    });
  });

  await page.route(`**/api/v1/orders/${orderId}`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(orders[0]),
    });
  });

  await page.route(`**/api/v1/orders/${orderId}/confirm`, async (route) => {
    await route.fulfill({ status: 204 });
  });

  await page.route("**/api/v1/notifications?**", async (route) => {
    const url = new URL(route.request().url());
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const filtered = unreadOnly
      ? notifications.filter((notification) => notification.readAt === null)
      : notifications;

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ data: filtered }),
    });
  });

  await page.route(`**/api/v1/notifications/${notificationId}`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(notifications[0]),
    });
  });

  await page.route(`**/api/v1/notifications/${notificationId}/read`, async (route) => {
    await route.fulfill({ status: 204 });
  });
}
