import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { CreateDisputeDTO } from "../dtos/orders.dto";

export class CreateDisputeUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: CreateDisputeDTO): Promise<void> {
    await this.orderRepository.createDispute({
      orderId: dto.orderId,
      reporterId: dto.reporterId,
      reason: dto.reason,
      details: dto.details,
    });
  }
}
