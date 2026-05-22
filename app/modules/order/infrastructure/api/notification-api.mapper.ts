import { createNotification } from "~/modules/order/domain/entities/notification";
import type { Notification } from "~/modules/order/domain/entities/notification";
import type { NotificationApiResponse } from "./schemas";

export class NotificationApiMapper {
  static toDomain(raw: NotificationApiResponse): Notification {
    return createNotification({
      id: raw.id,
      orderId: raw.orderId,
      title: raw.title,
      body: raw.body,
      channel: raw.channel,
      type: raw.type,
      createdAt: raw.createdAt,
      readAt: raw.readAt ?? null,
      metadata: raw.metadata,
    });
  }
}
