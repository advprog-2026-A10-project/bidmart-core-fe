import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { ConfirmOrderDTO } from "../dtos/order.dto";

export class ConfirmOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: ConfirmOrderDTO): Promise<void> {
    await this.orderRepository.confirmOrder({
      orderId: dto.orderId,
      actorId: dto.actorId,
    });
  }
}
