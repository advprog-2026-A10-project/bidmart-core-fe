export type ListingStatus = "Draft" | "Active" | "Sold" | "Cancelled" | "Expired" | string;

export type CatalogListing = {
  readonly id: string;
  readonly sellerId: string;
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

export type PaginatedCatalogListings = {
  readonly data: CatalogListing[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
};
