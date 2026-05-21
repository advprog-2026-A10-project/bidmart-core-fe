import type {
  CatalogListing,
  CatalogListingDetail,
  CatalogListingImage,
  PaginatedCatalogListings,
} from "~/modules/catalog/domain/entities/catalog";
import type {
  CatalogListingApi,
  CatalogListingDetailApi,
  CatalogListingImageApi,
  PaginatedCatalogListingApi,
} from "./schemas";

export class CatalogApiMapper {
  static toListing(raw: CatalogListingApi): CatalogListing {
    return {
      id: raw.id,
      sellerId: raw.seller_id,
      sellerName: raw.seller_name,
      categoryId: raw.category_id,
      categoryName: raw.category_name,
      title: raw.title,
      description: raw.description,
      startPrice: raw.start_price,
      reservePrice: raw.reserve_price,
      currentPrice: raw.current_price,
      minIncrement: raw.min_increment,
      bidCount: raw.bid_count,
      status: raw.status,
      auctionId: raw.auction_id,
      startsAt: raw.starts_at,
      endsAt: raw.ends_at,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  static toImage(raw: CatalogListingImageApi): CatalogListingImage {
    return {
      id: raw.id,
      url: raw.url,
      order: raw.order,
    };
  }

  static toPaginatedListings(raw: PaginatedCatalogListingApi): PaginatedCatalogListings {
    return {
      data: raw.data.map((item) => CatalogApiMapper.toListing(item)),
      total: raw.total,
      page: raw.page,
      pageSize: raw.page_size,
    };
  }

  static toListingDetail(raw: CatalogListingDetailApi): CatalogListingDetail {
    const { images, ...listing } = raw;
    return {
      listing: CatalogApiMapper.toListing(listing),
      images: images.map((image) => CatalogApiMapper.toImage(image)),
    };
  }
}
