"use client";

import type { OrderId } from "./order";

/**
 * Notification — Domain Entity
 *
 * Describes the notifications flow, event metadata, and visibility state.
 */
export type Notification = {
  readonly id: NotificationId;
  readonly orderId: OrderId | null;
  readonly title: string;
  readonly body: string;
  readonly channel: NotificationChannel;
  readonly type: NotificationType;
  readonly createdAt: string; // ISO timestamp
  readonly readAt: string | null;
  readonly metadata?: Record<string, unknown>;
};

export type NotificationId = string & { readonly __brand: "NotificationId" };

export type NotificationChannel = "email" | "push" | "inbox";
export type NotificationType =
  | "BID_OUTBID"
  | "AUCTION_WON"
  | "AUCTION_LOST"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "PAYMENT_RECEIVED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "AUCTION_EXTENDED"
  | "BidPlaced"
  | "WinnerDetermined"
  | "OrderUpdate"
  | "System";

export function createNotificationId(value: string): NotificationId {
  if (!value || value.trim().length === 0) {
    throw new Error("NotificationId cannot be empty.");
  }
  return value as NotificationId;
}

export function createNotification(params: {
  id: string;
  orderId?: string | null;
  title: string;
  body: string;
  channel: NotificationChannel;
  type: NotificationType;
  createdAt: string;
  readAt?: string | null;
  metadata?: Record<string, unknown>;
}): Notification {
  return {
    id: createNotificationId(params.id),
    orderId: params.orderId ? (params.orderId as OrderId) : null,
    title: params.title,
    body: params.body,
    channel: params.channel,
    type: params.type,
    createdAt: params.createdAt,
    readAt: params.readAt ?? null,
    metadata: params.metadata,
  };
}

export type NotificationEventPayload = {
  readonly orderId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly channel: NotificationChannel;
  readonly metadata?: Record<string, unknown>;
};
