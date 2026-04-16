import type { Notification } from "~/modules/order/domain/entities/notification";
import type { INotificationRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { ListNotificationsDTO } from "../dtos/notifications.dto";

export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(dto: ListNotificationsDTO): Promise<Notification[]> {
    return this.notificationRepository.listNotifications({
      userId: dto.userId,
      limit: dto.limit,
      unreadOnly: dto.unreadOnly,
    });
  }
}
