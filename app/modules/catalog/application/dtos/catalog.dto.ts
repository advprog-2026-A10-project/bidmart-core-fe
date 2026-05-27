export type PaginationDTO = {
  page?: number;
  pageSize?: number;
};

export type BrowseCatalogDTO = PaginationDTO & {
  q?: string;
  categoryId?: number;
  min?: number;
  max?: number;
  endBefore?: string;
};

export type BrowseCategoryPathDTO = PaginationDTO & {
  categoryPath: string;
};

export type ListCategoriesDTO = {
  parentId?: number;
};

export type GetListingDetailDTO = {
  listingId: string;
};

export type CreateSellerListingDTO = {
  categoryId?: number | null;
  title: string;
  description: string;
  imageUrls: string[];
  startPrice: number;
  reservePrice?: number | null;
  minIncrement: number;
  startsAt: string;
  endsAt: string;
};

export type UpdateSellerListingDTO = {
  listingId: string;
  description?: string;
  imageUrls?: string[];
};

export type SellerListingActionDTO = {
  listingId: string;
};

export type PresignListingUploadDTO = {
  fileName: string;
  contentType?: string;
};

export type PresignedListingUploadDTO = {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  expiresInSeconds: number;
};
