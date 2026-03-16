import { apiClient } from "~/shared/infrastructure/http/api-client";
import type { Order } from "~/modules/order/domain/entities/order";
import type { IOrderRepository } from "~/modules/order/domain/repositories/order-repository.interface";
import { orderApiSchema } from "../api/schemas";
import { OrderApiMapper } from "../api/order-api.mapper";

/**
 * OrderApiRepository — concrete implementation of IOrderRepository.
 *
 * LSP: fully substitutable for IOrderRepository everywhere it is used.
 * OCP: new data sources extend IOrderRepository without modifying use-cases.
 *
 * All responses are validated against Zod schemas at this boundary (fail-fast).
 */
export class OrderApiRepository implements IOrderRepository {
  private readonly basePath = "/orders"; // TODO: update base path

  // TODO: implement interface methods, e.g.:
  // async getById(params: { id: string }): Promise<Order> {
  //   const raw = await apiClient.get<unknown>(`${this.basePath}/${params.id}`);
  //   const validated = orderApiSchema.parse(raw);
  //   return OrderApiMapper.toDomain(validated);
  // }
}
