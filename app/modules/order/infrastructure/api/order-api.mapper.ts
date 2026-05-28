import { createOrder } from "~/modules/order/domain/entities/order";
import type { Order } from "~/modules/order/domain/entities/order";
import type { OrderApiResponse, OrderListApiResponse } from "./schemas";

export class OrderApiMapper {
  static toDomain(raw: OrderApiResponse): Order {
    return createOrder({
      id: raw.id,
      lot: raw.lot,
      stage: raw.stage,
      status: raw.status,
      buyerId: raw.buyerId,
      sellerId: raw.sellerId,
      total: raw.total,
      currency: raw.currency,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      tags: raw.tags ?? [],
      lastActivity: raw.lastActivity,
    });
  }

  static listToDomain(raw: OrderListApiResponse): Order[] {
    return raw.data.map(OrderApiMapper.toDomain);
  }
}
