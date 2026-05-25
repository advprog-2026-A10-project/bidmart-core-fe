import type {
  BrowseCatalogDTO,
  BrowseCategoryPathDTO,
  CreateSellerListingDTO,
  GetListingDetailDTO,
  ListCategoriesDTO,
  PaginationDTO,
  PresignedListingUploadDTO,
  PresignListingUploadDTO,
  SellerListingActionDTO,
  UpdateSellerListingDTO,
} from "~/modules/catalog/application/dtos/catalog.dto";
import type {
  CatalogCategory,
  CatalogListingDetail,
  PaginatedCatalogListings,
} from "~/modules/catalog/domain/entities/catalog";
import type { ICatalogRepository } from "~/modules/catalog/domain/repositories/catalog-repository.interface";
import { apiClient } from "~/shared/infrastructure/http/api-client";
import { createModuleLogger } from "~/shared/infrastructure/logger/module-logger";
import { CatalogApiMapper } from "../api/catalog-api.mapper";
import {
  catalogCategoryApiSchema,
  catalogListingDetailApiSchema,
  paginatedCatalogListingApiSchema,
  presignedListingUploadApiSchema,
} from "../api/schemas";

const logger = createModuleLogger("catalog");

function encodeCategoryPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.trim().length > 0)
    .map((segment) => encodeURIComponent(segment.trim()))
    .join("/");
}

export class CatalogApiRepository implements ICatalogRepository {
  async browseCatalog(params: BrowseCatalogDTO): Promise<PaginatedCatalogListings> {
    return logger.trace("browseCatalog", async ({ requestId }) => {
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
        headers: { "X-Request-ID": requestId },
      });
      const validated = paginatedCatalogListingApiSchema.parse(raw);
      return CatalogApiMapper.toPaginatedListings(validated);
    });
  }

  async browseCategoryPath(params: BrowseCategoryPathDTO): Promise<PaginatedCatalogListings> {
    return logger.trace(
      "browseCategoryPath",
      async ({ requestId }) => {
        const encodedPath = encodeCategoryPath(params.categoryPath);
        const raw = await apiClient.get<unknown>(`/c/${encodedPath}`, {
          params: { page: params.page, page_size: params.pageSize },
          headers: { "X-Request-ID": requestId },
        });
        const validated = paginatedCatalogListingApiSchema.parse(raw);
        return CatalogApiMapper.toPaginatedListings(validated);
      },
      { categoryPath: params.categoryPath },
    );
  }

  async listCategories(params: ListCategoriesDTO): Promise<CatalogCategory[]> {
    return logger.trace("listCategories", async ({ requestId }) => {
      const raw = await apiClient.get<unknown>("/categories", {
        params: {
          parent_id: params.parentId,
        },
        headers: { "X-Request-ID": requestId },
      });
      const validated = catalogCategoryApiSchema.array().parse(raw);
      return validated.map((item) => CatalogApiMapper.toCategory(item));
    });
  }

  async getPublicListing(params: GetListingDetailDTO): Promise<CatalogListingDetail> {
    return logger.trace(
      "getPublicListing",
      async ({ requestId }) => {
        const raw = await apiClient.get<unknown>(`/listings/${params.listingId}`, {
          headers: { "X-Request-ID": requestId },
        });
        const validated = catalogListingDetailApiSchema.parse(raw);
        return CatalogApiMapper.toListingDetail(validated);
      },
      { listingId: params.listingId },
    );
  }

  async listMyListings(params: PaginationDTO): Promise<PaginatedCatalogListings> {
    return logger.trace("listMyListings", async ({ requestId }) => {
      const raw = await apiClient.get<unknown>("/seller/listings", {
        params: { page: params.page, page_size: params.pageSize },
        headers: { "X-Request-ID": requestId },
      });
      const validated = paginatedCatalogListingApiSchema.parse(raw);
      return CatalogApiMapper.toPaginatedListings(validated);
    });
  }

  async getMyListing(params: GetListingDetailDTO): Promise<CatalogListingDetail> {
    return logger.trace(
      "getMyListing",
      async ({ requestId }) => {
        const raw = await apiClient.get<unknown>(`/seller/listings/${params.listingId}`, {
          headers: { "X-Request-ID": requestId },
        });
        const validated = catalogListingDetailApiSchema.parse(raw);
        return CatalogApiMapper.toListingDetail(validated);
      },
      { listingId: params.listingId },
    );
  }

  async createListing(params: CreateSellerListingDTO): Promise<CatalogListingDetail> {
    return logger.trace("createListing", async ({ requestId }) => {
      const raw = await apiClient.post<unknown>(
        "/seller/listings",
        {
          category_id: params.categoryId ?? null,
          title: params.title,
          description: params.description,
          image_urls: params.imageUrls,
          start_price: params.startPrice,
          reserve_price: params.reservePrice ?? null,
          min_increment: params.minIncrement,
          starts_at: params.startsAt,
          ends_at: params.endsAt,
        },
        { headers: { "X-Request-ID": requestId } },
      );
      const validated = catalogListingDetailApiSchema.parse(raw);
      return CatalogApiMapper.toListingDetail(validated);
    });
  }

  async presignListingUpload(params: PresignListingUploadDTO): Promise<PresignedListingUploadDTO> {
    return logger.trace("presignListingUpload", async ({ requestId }) => {
      const raw = await apiClient.post<unknown>(
        "/seller/listings/uploads/presign",
        {
          file_name: params.fileName,
          content_type: params.contentType ?? null,
        },
        { headers: { "X-Request-ID": requestId } },
      );
      const validated = presignedListingUploadApiSchema.parse(raw);
      return {
        uploadUrl: validated.upload_url,
        publicUrl: validated.public_url,
        objectKey: validated.object_key,
        expiresInSeconds: validated.expires_in_seconds,
      };
    });
  }

  async updateListing(params: UpdateSellerListingDTO): Promise<CatalogListingDetail> {
    return logger.trace(
      "updateListing",
      async ({ requestId }) => {
        const raw = await apiClient.patch<unknown>(
          `/seller/listings/${params.listingId}`,
          {
            description: params.description,
            image_urls: params.imageUrls,
          },
          { headers: { "X-Request-ID": requestId } },
        );
        const validated = catalogListingDetailApiSchema.parse(raw);
        return CatalogApiMapper.toListingDetail(validated);
      },
      { listingId: params.listingId },
    );
  }

  async cancelListing(params: SellerListingActionDTO): Promise<void> {
    await logger.trace(
      "cancelListing",
      async ({ requestId }) => {
        await apiClient.delete(`/seller/listings/${params.listingId}`, {
          headers: { "X-Request-ID": requestId },
        });
      },
      { listingId: params.listingId },
    );
  }

  async publishListing(params: SellerListingActionDTO): Promise<CatalogListingDetail> {
    return logger.trace(
      "publishListing",
      async ({ requestId }) => {
        const raw = await apiClient.post<unknown>(
          `/seller/listings/${params.listingId}/publish`,
          undefined,
          { headers: { "X-Request-ID": requestId } },
        );
        const validated = catalogListingDetailApiSchema.parse(raw);
        return CatalogApiMapper.toListingDetail(validated);
      },
      { listingId: params.listingId },
    );
  }
}
