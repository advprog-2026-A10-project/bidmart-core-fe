import { CatalogApiRepository } from "../repositories/catalog-api.repository";
import { GetCatalogUseCase } from "~/modules/catalog/application/use-cases/get-catalog.use-case";

/**
 * CatalogUseCaseFactory — wires up the dependency graph for the catalog module.
 *
 * Factory pattern: centralises construction so that swap-ins (e.g. mock repos in tests)
 * only require changing this one place. Use cases are unaware of which concrete
 * repository implementation they receive (DIP satisfied).
 */
export type CatalogUseCases = {
  getCatalog: GetCatalogUseCase;
};

export function createCatalogUseCases(): CatalogUseCases {
  const catalogRepository = new CatalogApiRepository();

  return {
    getCatalog: new GetCatalogUseCase(catalogRepository),
  };
}

// Singleton for client-side usage (avoids re-creating on every render)
let _catalogUseCases: CatalogUseCases | undefined;

export function getCatalogUseCases(): CatalogUseCases {
  if (!_catalogUseCases) {
    _catalogUseCases = createCatalogUseCases();
  }
  return _catalogUseCases;
}
