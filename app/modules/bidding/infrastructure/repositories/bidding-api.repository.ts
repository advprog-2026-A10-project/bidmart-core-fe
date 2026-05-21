import { apiClient } from "~/shared/infrastructure/http/api-client";
import type { Bidding } from "~/modules/bidding/domain/entities/bidding";
import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import { biddingApiSchema } from "../api/schemas";
import { BiddingApiMapper } from "../api/bidding-api.mapper";

/**
 * BiddingApiRepository — concrete implementation of IBiddingRepository.
 *
 * LSP: fully substitutable for IBiddingRepository everywhere it is used.
 * OCP: new data sources extend IBiddingRepository without modifying use-cases.
 *
 * All responses are validated against Zod schemas at this boundary (fail-fast).
 */
export class BiddingApiRepository implements IBiddingRepository {
  private readonly basePath = "/biddings";

  async getById(params: { id: string }): Promise<Bidding> {
    const raw = await apiClient.get<unknown>(`${this.basePath}/${params.id}`);
    const validated = biddingApiSchema.parse(raw);
    return BiddingApiMapper.toDomain(validated);
  }
}
