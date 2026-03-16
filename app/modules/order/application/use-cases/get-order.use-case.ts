import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";

/**
 * GetOrderUseCase — TODO: describe what this use-case does.
 */
export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(/* dto: TODO */): Promise<void> {
    // TODO: implement use-case logic using this.orderRepository
  }
}
