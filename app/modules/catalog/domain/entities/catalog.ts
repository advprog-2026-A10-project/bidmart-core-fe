export type ListingStatus = "Draft" | "Active" | "Sold" | "Cancelled" | "Expired" | string;

// `sellerId` and `reservePrice` are only populated on seller-scoped endpoints.
// Buyer/public endpoints omit them — reserve price must not leak to the public.
export type CatalogListing = {
  readonly id: string;
  readonly sellerId: string | null;
  readonly sellerName: string;
  readonly categoryId: number | null;
  readonly categoryName: string;
  readonly title: string;
  readonly description: string;
  readonly startPrice: number;
  readonly reservePrice: number | null;
  readonly currentPrice: number;
  readonly minIncrement: number;
  readonly bidCount: number;
  readonly status: ListingStatus;
  readonly auctionId: string | null;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly thumbnailUrl: string | null;
};

export type CatalogListingImage = {
  readonly id: string;
  readonly url: string;
  readonly order: number;
};

export type CatalogListingDetail = {
  readonly listing: CatalogListing;
  readonly images: CatalogListingImage[];
};

export type CatalogCategory = {
  readonly id: number;
  readonly parentId: number | null;
  readonly name: string;
  readonly slug: string;
  readonly imageUrl: string | null;
  readonly childCount: number;
};

export type PaginatedCatalogListings = {
  readonly data: CatalogListing[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
};
