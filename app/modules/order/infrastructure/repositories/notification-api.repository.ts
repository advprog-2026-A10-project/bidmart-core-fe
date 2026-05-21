import { apiClient } from "~/shared/infrastructure/http/api-client";
import type {
  Notification,
  NotificationEventPayload,
} from "~/modules/order/domain/entities/notification";
import type { INotificationRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import { NotificationApiMapper } from "../api/notification-api.mapper";
import type { NotificationApiResponse } from "../api/schemas";

export class NotificationApiRepository implements INotificationRepository {
  private readonly basePath = "/notifications";

  async listNotifications(params: {
    userId?: string;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<Notification[]> {
    const raw = await apiClient.get<{ data: NotificationApiResponse[] }>(this.basePath, {
      params: {
        userId: params.userId,
        limit: params.limit,
        unreadOnly: params.unreadOnly,
      },
    });

    return raw.data.map(NotificationApiMapper.toDomain);
  }

  async getNotificationById(params: { id: string }): Promise<Notification> {
    const raw = await apiClient.get<NotificationApiResponse>(`${this.basePath}/${params.id}`);
    return NotificationApiMapper.toDomain(raw);
  }

  async markAsRead(params: { id: string; actorId?: string }): Promise<void> {
    await apiClient.patch(`${this.basePath}/${params.id}/read`, { actorId: params.actorId });
  }

  async publishEvent(event: NotificationEventPayload): Promise<void> {
    await apiClient.post("/events/notifications", event);
  }
}
