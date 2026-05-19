import type {
  BrowseCatalogDTO,
  BrowseCategoryPathDTO,
  CreateSellerListingDTO,
  GetListingDetailDTO,
  PaginationDTO,
  SellerListingActionDTO,
  UpdateSellerListingDTO,
} from "~/modules/catalog/application/dtos/catalog.dto";
import type {
  CatalogListingDetail,
  PaginatedCatalogListings,
} from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";
import { apiClient } from "~/shared/infrastructure/http/api-client";
import { CatalogApiMapper } from "../api/catalog-api.mapper";
import { catalogListingDetailApiSchema, paginatedCatalogListingApiSchema } from "../api/schemas";

function encodeCategoryPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.trim().length > 0)
    .map((segment) => encodeURIComponent(segment.trim()))
    .join("/");
}

export class CatalogApiRepository implements ICatalogRepository {
  async browseCatalog(params: BrowseCatalogDTO): Promise<PaginatedCatalogListings> {
    const raw = await apiClient.get<unknown>("/catalog", {
      params: {
        q: params.q,
        category_id: params.categoryId,
        min: params.min,
        max: params.max,
        endBefore: params.endBefore,
        page: params.page,
        page_size: params.pageSize,
      },
    });
    const validated = paginatedCatalogListingApiSchema.parse(raw);
    return CatalogApiMapper.toPaginatedListings(validated);
  }

  async browseCategoryPath(params: BrowseCategoryPathDTO): Promise<PaginatedCatalogListings> {
    const encodedPath = encodeCategoryPath(params.categoryPath);
    const raw = await apiClient.get<unknown>(`/c/${encodedPath}`, {
      params: {
        page: params.page,
        page_size: params.pageSize,
      },
    });
    const validated = paginatedCatalogListingApiSchema.parse(raw);
    return CatalogApiMapper.toPaginatedListings(validated);
  }

  async getPublicListing(params: GetListingDetailDTO): Promise<CatalogListingDetail> {
    const raw = await apiClient.get<unknown>(`/listings/${params.listingId}`);
    const validated = catalogListingDetailApiSchema.parse(raw);
    return CatalogApiMapper.toListingDetail(validated);
  }

  async listMyListings(params: PaginationDTO): Promise<PaginatedCatalogListings> {
    const raw = await apiClient.get<unknown>("/seller/listings", {
      params: {
        page: params.page,
        page_size: params.pageSize,
      },
    });
    const validated = paginatedCatalogListingApiSchema.parse(raw);
    return CatalogApiMapper.toPaginatedListings(validated);
  }

  async getMyListing(params: GetListingDetailDTO): Promise<CatalogListingDetail> {
    const raw = await apiClient.get<unknown>(`/seller/listings/${params.listingId}`);
    const validated = catalogListingDetailApiSchema.parse(raw);
    return CatalogApiMapper.toListingDetail(validated);
  }

  async createListing(params: CreateSellerListingDTO): Promise<CatalogListingDetail> {
    const raw = await apiClient.post<unknown>("/seller/listings", {
      category_id: params.categoryId ?? null,
      title: params.title,
      description: params.description,
      image_urls: params.imageUrls,
      start_price: params.startPrice,
      reserve_price: params.reservePrice ?? null,
      min_increment: params.minIncrement,
      starts_at: params.startsAt,
      ends_at: params.endsAt,
    });
    const validated = catalogListingDetailApiSchema.parse(raw);
    return CatalogApiMapper.toListingDetail(validated);
  }

  async updateListing(params: UpdateSellerListingDTO): Promise<CatalogListingDetail> {
    const raw = await apiClient.patch<unknown>(`/seller/listings/${params.listingId}`, {
      description: params.description,
      image_urls: params.imageUrls,
    });
    const validated = catalogListingDetailApiSchema.parse(raw);
    return CatalogApiMapper.toListingDetail(validated);
  }

  async cancelListing(params: SellerListingActionDTO): Promise<void> {
    await apiClient.delete(`/seller/listings/${params.listingId}`);
  }

  async publishListing(params: SellerListingActionDTO): Promise<CatalogListingDetail> {
    const raw = await apiClient.post<unknown>(`/seller/listings/${params.listingId}/publish`);
    const validated = catalogListingDetailApiSchema.parse(raw);
    return CatalogApiMapper.toListingDetail(validated);
  }
}
