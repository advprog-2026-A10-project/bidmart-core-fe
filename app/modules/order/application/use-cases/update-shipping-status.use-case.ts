import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { UpdateShippingStatusDTO } from "../dtos/order.dto";

export class UpdateShippingStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: UpdateShippingStatusDTO): Promise<void> {
    await this.orderRepository.updateShippingStatus({
      orderId: dto.orderId,
      status: dto.status,
      tracking: dto.tracking,
    });
  }
}
