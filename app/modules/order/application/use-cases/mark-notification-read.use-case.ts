import type { INotificationRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { MarkNotificationReadDTO } from "../dtos/notifications.dto";

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(dto: MarkNotificationReadDTO): Promise<void> {
    await this.notificationRepository.markAsRead({
      id: dto.notificationId,
      actorId: dto.actorId,
    });
  }
}
