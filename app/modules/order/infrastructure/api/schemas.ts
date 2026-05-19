import { z } from "zod";

export const orderApiSchema = z.object({
  id: z.string(),
  lot: z.string(),
  stage: z.enum(["active", "processing", "completed", "cancelled"]),
  status: z.enum([
    "Awaiting Payment",
    "In Transit",
    "Needs Confirmation",
    "Delivered",
    "Dispute Closed",
    "Dispute Alert",
  ]),
  buyerId: z.string(),
  sellerId: z.string(),
  total: z.string(),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()).optional(),
  lastActivity: z.string(),
});

export const orderListApiSchema = z.object({
  data: z.array(orderApiSchema),
  total: z.number().optional(),
});

export const notificationApiSchema = z.object({
  id: z.string(),
  orderId: z.string().nullable(),
  title: z.string(),
  body: z.string(),
  channel: z.enum(["email", "push", "inbox"]),
  type: z.enum([
    "BID_OUTBID",
    "AUCTION_WON",
    "AUCTION_LOST",
    "ORDER_SHIPPED",
    "ORDER_DELIVERED",
    "PAYMENT_RECEIVED",
    "DISPUTE_OPENED",
    "DISPUTE_RESOLVED",
    "AUCTION_EXTENDED",
    "BidPlaced",
    "WinnerDetermined",
    "OrderUpdate",
    "System",
  ]),
  createdAt: z.string(),
  readAt: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const notificationListApiSchema = z.object({
  data: z.array(notificationApiSchema),
});

export type OrderApiResponse = z.infer<typeof orderApiSchema>;
export type OrderListApiResponse = z.infer<typeof orderListApiSchema>;
export type NotificationApiResponse = z.infer<typeof notificationApiSchema>;
