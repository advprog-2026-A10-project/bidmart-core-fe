import type { Order } from "~/modules/order/domain/entities/order";
import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { ListOrdersDTO } from "../dtos/order.dto";

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: ListOrdersDTO): Promise<Order[]> {
    return this.orderRepository.listOrders({
      id: dto.userId,
      role: dto.role,
      stage: dto.stage,
      limit: dto.limit,
      offset: dto.offset,
    });
  }
}
