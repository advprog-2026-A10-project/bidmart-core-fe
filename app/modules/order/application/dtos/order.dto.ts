import type { OrderStage } from "~/modules/order/domain/entities/order";
import type { NotificationEventPayload } from "~/modules/order/domain/entities/notification";

export type ListOrdersDTO = {
  userId: string;
  role: "buyer" | "seller";
  stage?: OrderStage;
  limit?: number;
  offset?: number;
};

export type GetOrderDTO = {
  orderId: string;
};

export type ConfirmOrderDTO = {
  orderId: string;
  actorId: string;
};

export type CreateDisputeDTO = {
  orderId: string;
  reporterId: string;
  reason: string;
  details?: string;
};

export type UpdateShippingStatusDTO = {
  orderId: string;
  status: string;
  tracking?: string;
};

export type ListNotificationsDTO = {
  userId: string;
  limit?: number;
  unreadOnly?: boolean;
};

export type GetNotificationDTO = {
  notificationId: string;
};

export type MarkNotificationReadDTO = {
  notificationId: string;
  actorId: string;
};

export type PublishNotificationEventDTO = NotificationEventPayload;
