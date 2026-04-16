import type { Notification } from "~/modules/order/domain/entities/notification";
import type { INotificationRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { GetNotificationDTO } from "../dtos/notifications.dto";

export class GetNotificationUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(dto: GetNotificationDTO): Promise<Notification> {
    return this.notificationRepository.getNotificationById({ id: dto.notificationId });
  }
}
