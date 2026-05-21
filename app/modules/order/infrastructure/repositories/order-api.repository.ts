import { apiClient } from "~/shared/infrastructure/http/api-client";
import { createModuleLogger } from "~/shared/infrastructure/logger/module-logger";
import type { Order } from "~/modules/order/domain/entities/order";
import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import { OrderApiMapper } from "../api/order-api.mapper";
import type { OrderApiResponse, OrderListApiResponse } from "../api/schemas";

const logger = createModuleLogger("order");

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
    return logger.trace(
      "listOrders",
      async ({ requestId }) => {
        const path = params.role === "seller" ? this.sellerBasePath : this.basePath;
        const raw = await apiClient.get<OrderListApiResponse>(path, {
          params: {
            userId: params.id,
            stage: params.stage,
            limit: params.limit,
            offset: params.offset,
          },
          headers: { "X-Request-ID": requestId },
        });
        return OrderApiMapper.listToDomain(raw);
      },
      { role: params.role, stage: params.stage ?? "all" },
    );
  }

  async getOrderById(params: { id: string }): Promise<Order> {
    return logger.trace(
      "getOrderById",
      async ({ requestId }) => {
        const raw = await apiClient.get<OrderApiResponse>(`${this.basePath}/${params.id}`, {
          headers: { "X-Request-ID": requestId },
        });
        return OrderApiMapper.toDomain(raw);
      },
      { orderId: params.id },
    );
  }

  async confirmOrder(params: { orderId: string; actorId?: string }): Promise<void> {
    await logger.trace(
      "confirmOrder",
      async ({ requestId }) => {
        await apiClient.post(
          `${this.basePath}/${params.orderId}/confirm`,
          { actor_id: params.actorId },
          { headers: { "X-Request-ID": requestId } },
        );
      },
      { orderId: params.orderId },
    );
  }

  async createDispute(params: {
    orderId: string;
    reporterId?: string;
    reason: string;
    details?: string;
  }): Promise<void> {
    await logger.trace(
      "createDispute",
      async ({ requestId }) => {
        await apiClient.post(
          `${this.basePath}/${params.orderId}/dispute/new`,
          {
            reporter_id: params.reporterId,
            reason: params.reason,
            details: params.details,
          },
          { headers: { "X-Request-ID": requestId } },
        );
      },
      { orderId: params.orderId },
    );
  }

  async updateShippingStatus(params: {
    orderId: string;
    status: string;
    tracking?: string;
  }): Promise<void> {
    await logger.trace(
      "updateShippingStatus",
      async ({ requestId }) => {
        await apiClient.patch(
          `${this.sellerBasePath}/${params.orderId}/shipping`,
          { status: params.status, tracking: params.tracking },
          { headers: { "X-Request-ID": requestId } },
        );
      },
      { orderId: params.orderId, status: params.status },
    );
  }
}
