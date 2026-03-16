import type { Order } from "../entities/order";

/**
 * IOrderRepository — Repository Interface (Port)
 *
 * Defines the contract for order data access. Use cases depend on this
 * abstraction, not on any concrete implementation (DIP).
 */
export interface IOrderRepository {
  // TODO: add repository methods matching your use-cases
  // Example:
  // getById(params: { id: string }): Promise<Order>;
}
