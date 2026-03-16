import { createOrder } from "~/modules/order/domain/entities/order";
import type { Order } from "~/modules/order/domain/entities/order";
import type { OrderApiResponse } from "./schemas";

/**
 * OrderApiMapper — maps raw API response objects to domain entities.
 *
 * SRP: single responsibility — translation between API shape and domain shape.
 */
export class OrderApiMapper {
  static toDomain(raw: OrderApiResponse): Order {
    return createOrder({
      id: raw.id,
      // TODO: map remaining fields
    });
  }
}
