import { createCatalog } from "~/modules/catalog/domain/entities/catalog";
import type { Catalog } from "~/modules/catalog/domain/entities/catalog";
import type { CatalogApiResponse } from "./schemas";

/**
 * CatalogApiMapper — maps raw API response objects to domain entities.
 *
 * SRP: single responsibility — translation between API shape and domain shape.
 */
export class CatalogApiMapper {
  static toDomain(raw: CatalogApiResponse): Catalog {
    return createCatalog({
      id: raw.id,
      // TODO: map remaining fields
    });
  }
}
