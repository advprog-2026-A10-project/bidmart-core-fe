import { CatalogApiRepository } from "../repositories/catalog-api.repository";
import { BrowseCategoryPathCatalogUseCase } from "~/modules/catalog/application/use-cases/browse-category-path-catalog.use-case";
import { CancelListingUseCase } from "~/modules/catalog/application/use-cases/cancel-listing.use-case";
import { CreateListingUseCase } from "~/modules/catalog/application/use-cases/create-listing.use-case";
import { GetCatalogUseCase } from "~/modules/catalog/application/use-cases/get-catalog.use-case";
import { GetMyListingUseCase } from "~/modules/catalog/application/use-cases/get-my-listing.use-case";
import { GetPublicListingUseCase } from "~/modules/catalog/application/use-cases/get-public-listing.use-case";
import { ListMyListingsUseCase } from "~/modules/catalog/application/use-cases/list-my-listings.use-case";
import { ListCategoriesUseCase } from "~/modules/catalog/application/use-cases/list-categories.use-case";
import { PublishListingUseCase } from "~/modules/catalog/application/use-cases/publish-listing.use-case";
import { UpdateListingUseCase } from "~/modules/catalog/application/use-cases/update-listing.use-case";

/**
 * CatalogUseCaseFactory — wires up the dependency graph for the catalog module.
 *
 * Factory pattern: centralises construction so that swap-ins (e.g. mock repos in tests)
 * only require changing this one place. Use cases are unaware of which concrete
 * repository implementation they receive (DIP satisfied).
 */
export type CatalogUseCases = {
  getCatalog: GetCatalogUseCase;
  browseCategoryPathCatalog: BrowseCategoryPathCatalogUseCase;
  listCategories: ListCategoriesUseCase;
  getPublicListing: GetPublicListingUseCase;
  listMyListings: ListMyListingsUseCase;
  getMyListing: GetMyListingUseCase;
  createListing: CreateListingUseCase;
  updateListing: UpdateListingUseCase;
  cancelListing: CancelListingUseCase;
  publishListing: PublishListingUseCase;
};

export function createCatalogUseCases(): CatalogUseCases {
  const catalogRepository = new CatalogApiRepository();

  return {
    getCatalog: new GetCatalogUseCase(catalogRepository),
    browseCategoryPathCatalog: new BrowseCategoryPathCatalogUseCase(catalogRepository),
    listCategories: new ListCategoriesUseCase(catalogRepository),
    getPublicListing: new GetPublicListingUseCase(catalogRepository),
    listMyListings: new ListMyListingsUseCase(catalogRepository),
    getMyListing: new GetMyListingUseCase(catalogRepository),
    createListing: new CreateListingUseCase(catalogRepository),
    updateListing: new UpdateListingUseCase(catalogRepository),
    cancelListing: new CancelListingUseCase(catalogRepository),
    publishListing: new PublishListingUseCase(catalogRepository),
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
