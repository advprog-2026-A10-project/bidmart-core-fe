import type { INotificationRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { PublishNotificationEventDTO } from "../dtos/notifications.dto";

export class PublishNotificationEventUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(dto: PublishNotificationEventDTO): Promise<void> {
    await this.notificationRepository.publishEvent(dto);
  }
}
