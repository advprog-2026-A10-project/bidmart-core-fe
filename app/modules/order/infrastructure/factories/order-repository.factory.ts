import { OrderApiRepository } from "../repositories/order-api.repository";
import { GetOrderUseCase } from "~/modules/order/application/use-cases/get-order.use-case";

/**
 * OrderUseCaseFactory — wires up the dependency graph for the order module.
 *
 * Factory pattern: centralises construction so that swap-ins (e.g. mock repos in tests)
 * only require changing this one place. Use cases are unaware of which concrete
 * repository implementation they receive (DIP satisfied).
 */
export type OrderUseCases = {
  getOrder: GetOrderUseCase;
};

export function createOrderUseCases(): OrderUseCases {
  const orderRepository = new OrderApiRepository();

  return {
    getOrder: new GetOrderUseCase(orderRepository),
  };
}

// Singleton for client-side usage (avoids re-creating on every render)
let _orderUseCases: OrderUseCases | undefined;

export function getOrderUseCases(): OrderUseCases {
  if (!_orderUseCases) {
    _orderUseCases = createOrderUseCases();
  }
  return _orderUseCases;
}
