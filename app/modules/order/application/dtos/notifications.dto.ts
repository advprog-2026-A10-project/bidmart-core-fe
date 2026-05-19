import type { NotificationEventPayload } from "~/modules/order/domain/entities/notification";

export type ListNotificationsDTO = {
  userId?: string;
  limit?: number;
  unreadOnly?: boolean;
};

export type GetNotificationDTO = {
  notificationId: string;
};

export type MarkNotificationReadDTO = {
  notificationId: string;
  actorId?: string;
};

export type PublishNotificationEventDTO = NotificationEventPayload;
