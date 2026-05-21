import { apiClient } from "~/shared/infrastructure/http/api-client";
import type { Order } from "~/modules/order/domain/entities/order";
import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import { OrderApiMapper } from "../api/order-api.mapper";
import type { OrderApiResponse, OrderListApiResponse } from "../api/schemas";

export class OrderApiRepository implements IOrderRepository {
  private readonly basePath = "/orders";
  private readonly sellerBasePath = "/seller/orders";

  async listOrders(params: {
    id?: string;
    role: "buyer" | "seller";
    stage?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const path = params.role === "seller" ? this.sellerBasePath : this.basePath;
    const query: Record<string, string | number | undefined> = {
      userId: params.id,
      stage: params.stage,
      limit: params.limit,
      offset: params.offset,
    };

    const raw = await apiClient.get<OrderListApiResponse>(path, { params: query });
    return OrderApiMapper.listToDomain(raw);
  }

  async getOrderById(params: { id: string }): Promise<Order> {
    const raw = await apiClient.get<OrderApiResponse>(`${this.basePath}/${params.id}`);
    return OrderApiMapper.toDomain(raw);
  }

  async confirmOrder(params: { orderId: string; actorId?: string }): Promise<void> {
    await apiClient.post(`${this.basePath}/${params.orderId}/confirm`, {
      actor_id: params.actorId,
    });
  }

  async createDispute(params: {
    orderId: string;
    reporterId?: string;
    reason: string;
    details?: string;
  }): Promise<void> {
    await apiClient.post(`${this.basePath}/${params.orderId}/dispute/new`, {
      reporter_id: params.reporterId,
      reason: params.reason,
      details: params.details,
    });
  }

  async updateShippingStatus(params: {
    orderId: string;
    status: string;
    tracking?: string;
  }): Promise<void> {
    await apiClient.patch(`${this.sellerBasePath}/${params.orderId}/shipping`, {
      status: params.status,
      tracking: params.tracking,
    });
  }
}
