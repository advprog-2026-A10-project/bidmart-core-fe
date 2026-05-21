import { apiClient } from "~/shared/infrastructure/http/api-client";
import { createModuleLogger } from "~/shared/infrastructure/logger/module-logger";
import type { Notification } from "~/modules/order/domain/entities/notification";
import type { INotificationRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import { NotificationApiMapper } from "../api/notification-api.mapper";
import type { NotificationApiResponse } from "../api/schemas";

// Notifications are part of the order module on the backend (WBS §5.1) so
// they share the `order` log namespace; this keeps a single
// `RUST_LOG=core_be.order.request` filter useful across both surfaces.
const logger = createModuleLogger("order");

export class NotificationApiRepository implements INotificationRepository {
  private readonly basePath = "/notifications";

  async listNotifications(params: {
    userId?: string;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<Notification[]> {
    return logger.trace(
      "listNotifications",
      async ({ requestId }) => {
        const raw = await apiClient.get<{ data: NotificationApiResponse[] }>(this.basePath, {
          params: {
            userId: params.userId,
            limit: params.limit,
            unreadOnly: params.unreadOnly,
          },
          headers: { "X-Request-ID": requestId },
        });
        return raw.data.map(NotificationApiMapper.toDomain);
      },
      { unreadOnly: params.unreadOnly ?? false },
    );
  }

  async getNotificationById(params: { id: string }): Promise<Notification> {
    return logger.trace(
      "getNotificationById",
      async ({ requestId }) => {
        const raw = await apiClient.get<NotificationApiResponse>(
          `${this.basePath}/${params.id}`,
          { headers: { "X-Request-ID": requestId } },
        );
        return NotificationApiMapper.toDomain(raw);
      },
      { notificationId: params.id },
    );
  }

  async markAsRead(params: { id: string; actorId?: string }): Promise<void> {
    await logger.trace(
      "markNotificationAsRead",
      async ({ requestId }) => {
        await apiClient.patch(
          `${this.basePath}/${params.id}/read`,
          { actorId: params.actorId },
          { headers: { "X-Request-ID": requestId } },
        );
      },
      { notificationId: params.id },
    );
  }
}
