import type { Catalog } from "../entities/catalog";

/**
 * ICatalogRepository — Repository Interface (Port)
 *
 * Defines the contract for catalog data access. Use cases depend on this
 * abstraction, not on any concrete implementation (DIP).
 */
export interface ICatalogRepository {
  // TODO: add repository methods matching your use-cases
  // Example:
  // getById(params: { id: string }): Promise<Catalog>;
}
