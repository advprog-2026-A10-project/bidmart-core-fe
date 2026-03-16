import { apiClient } from "~/shared/infrastructure/http/api-client";
import type { Catalog } from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";
import { catalogApiSchema } from "../api/schemas";
import { CatalogApiMapper } from "../api/catalog-api.mapper";

/**
 * CatalogApiRepository — concrete implementation of ICatalogRepository.
 *
 * LSP: fully substitutable for ICatalogRepository everywhere it is used.
 * OCP: new data sources extend ICatalogRepository without modifying use-cases.
 *
 * All responses are validated against Zod schemas at this boundary (fail-fast).
 */
export class CatalogApiRepository implements ICatalogRepository {
  private readonly basePath = "/catalogs"; // TODO: update base path

  // TODO: implement interface methods, e.g.:
  // async getById(params: { id: string }): Promise<Catalog> {
  //   const raw = await apiClient.get<unknown>(`${this.basePath}/${params.id}`);
  //   const validated = catalogApiSchema.parse(raw);
  //   return CatalogApiMapper.toDomain(validated);
  // }
}
