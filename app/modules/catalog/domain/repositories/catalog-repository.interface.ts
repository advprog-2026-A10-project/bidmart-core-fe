import type {
  BrowseCatalogDTO,
  BrowseCategoryPathDTO,
  CreateSellerListingDTO,
  GetListingDetailDTO,
  ListCategoriesDTO,
  PaginationDTO,
  SellerListingActionDTO,
  UpdateSellerListingDTO,
} from "~/modules/catalog/application/dtos/catalog.dto";
import type {
  CatalogCategory,
  CatalogListingDetail,
  PaginatedCatalogListings,
} from "~/modules/catalog/domain/entities/catalog";

/**
 * ICatalogRepository — Repository Interface (Port)
 *
 * Defines the contract for catalog data access. Use cases depend on this
 * abstraction, not on any concrete implementation (DIP).
 */
export interface ICatalogRepository {
  browseCatalog(params: BrowseCatalogDTO): Promise<PaginatedCatalogListings>;
  browseCategoryPath(params: BrowseCategoryPathDTO): Promise<PaginatedCatalogListings>;
  listCategories(params: ListCategoriesDTO): Promise<CatalogCategory[]>;
  getPublicListing(params: GetListingDetailDTO): Promise<CatalogListingDetail>;

  listMyListings(params: PaginationDTO): Promise<PaginatedCatalogListings>;
  getMyListing(params: GetListingDetailDTO): Promise<CatalogListingDetail>;
  createListing(params: CreateSellerListingDTO): Promise<CatalogListingDetail>;
  updateListing(params: UpdateSellerListingDTO): Promise<CatalogListingDetail>;
  cancelListing(params: SellerListingActionDTO): Promise<void>;
  publishListing(params: SellerListingActionDTO): Promise<CatalogListingDetail>;
}
