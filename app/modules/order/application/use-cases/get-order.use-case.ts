import type { Order } from "~/modules/order/domain/entities/order";
import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import type { GetOrderDTO } from "../dtos/orders.dto";

export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: GetOrderDTO): Promise<Order> {
    return this.orderRepository.getOrderById({ id: dto.orderId });
  }
}
