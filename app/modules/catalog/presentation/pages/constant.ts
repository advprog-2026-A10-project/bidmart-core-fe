// Inline DTO interfaces for catalog module mock payloads

interface CreateListingRequestDTO {
  title: string;
  description: string;
  startingPrice: number;
  category: string;
  condition: string;
  imageUrl: string;
  auctionDuration: number;
}

interface CreateListingResponseDTO {
  id: string;
  status: "active";
}

interface UpdateListingRequestDTO {
  title: string;
  description: string;
  startingPrice: number;
}

interface UpdateListingResponseDTO {
  id: string;
  status: "updated";
}

interface CancelListingRequestDTO {
  listingId: string;
  reason: string;
}

interface CancelListingResponseDTO {
  success: boolean;
}

interface SearchCatalogRequestDTO {
  q: string;
  minPrice?: number;
  maxPrice?: number;
  endBefore?: string;
  category?: string;
  page?: number;
}

interface SearchCatalogResponseDTO {
  items: Array<{
    id: string;
    title: string;
    currentBid: number;
    endsAt: string;
    imageUrl: string;
    category: string;
  }>;
  total: number;
  page: number;
}

interface GetListingDetailRequestDTO {
  listingId: string;
}

interface GetListingDetailResponseDTO {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentBid: number;
  category: string;
  condition: string;
  imageUrl: string;
  status: string;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  bidCount: number;
  endsAt: string;
}

interface MockListingDTO {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentBid: number;
  category: string;
  condition: string;
  imageUrl: string;
  status: string;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  bidCount: number;
  endsAt: string;
}

interface MockCurrentUserDTO {
  id: string;
  name: string;
  role: "buyer" | "seller";
}

export const CATALOG_MOCK_PAYLOADS = {
  createListing: {
    request: {
      title: "Vintage Watch",
      description: "Rare vintage watch from 1980s",
      startingPrice: 500000,
      category: "Electronics",
      condition: "Used",
      imageUrl: "https://example.com/watch.jpg",
      auctionDuration: 7,
    } satisfies CreateListingRequestDTO,
    response: {
      success: {
        id: "listing-1",
        status: "active" as const,
      } satisfies CreateListingResponseDTO,
    },
  },
  updateListing: {
    request: {
      title: "Vintage Watch - Updated",
      description: "Rare vintage watch from 1980s - updated",
      startingPrice: 550000,
    } satisfies UpdateListingRequestDTO,
    response: {
      success: {
        id: "listing-1",
        status: "updated" as const,
      } satisfies UpdateListingResponseDTO,
    },
  },
  cancelListing: {
    request: {
      listingId: "listing-1",
      reason: "No longer available",
    } satisfies CancelListingRequestDTO,
    response: {
      success: {
        success: true,
      } satisfies CancelListingResponseDTO,
    },
  },
  searchCatalog: {
    request: {
      q: "watch",
      minPrice: 100000,
      maxPrice: 5000000,
      category: "Electronics",
      page: 1,
    } satisfies SearchCatalogRequestDTO,
    response: {
      success: {
        items: [
          {
            id: "listing-1",
            title: "Vintage Watch",
            currentBid: 750000,
            endsAt: "2026-03-14T10:00:00Z",
            imageUrl: "https://example.com/watch.jpg",
            category: "Electronics",
          },
          {
            id: "listing-2",
            title: "Digital Watch",
            currentBid: 250000,
            endsAt: "2026-03-15T10:00:00Z",
            imageUrl: "https://example.com/digital-watch.jpg",
            category: "Electronics",
          },
        ],
        total: 2,
        page: 1,
      } satisfies SearchCatalogResponseDTO,
    },
  },
  getListingDetail: {
    request: {
      listingId: "listing-1",
    } satisfies GetListingDetailRequestDTO,
    response: {
      success: {
        id: "listing-1",
        title: "Vintage Watch",
        description: "Rare vintage watch from 1980s",
        startingPrice: 500000,
        currentBid: 750000,
        category: "Electronics",
        condition: "Used",
        imageUrl: "https://example.com/watch.jpg",
        status: "active",
        seller: {
          id: "user-1",
          name: "Budi Santoso",
          rating: 4.8,
        },
        bidCount: 12,
        endsAt: "2026-03-14T10:00:00Z",
      } satisfies GetListingDetailResponseDTO,
    },
  },
  mockListings: [
    {
      id: "listing-1",
      title: "Vintage Watch",
      description: "Rare vintage watch from 1980s",
      startingPrice: 500000,
      currentBid: 750000,
      category: "Electronics",
      condition: "Used",
      imageUrl: "https://example.com/watch.jpg",
      status: "active",
      seller: {
        id: "user-1",
        name: "Budi Santoso",
        rating: 4.8,
      },
      bidCount: 12,
      endsAt: "2026-03-14T10:00:00Z",
    },
    {
      id: "listing-2",
      title: "Digital Watch",
      description: "Modern digital watch with smart features",
      startingPrice: 200000,
      currentBid: 250000,
      category: "Electronics",
      condition: "New",
      imageUrl: "https://example.com/digital-watch.jpg",
      status: "active",
      seller: {
        id: "user-2",
        name: "Ahmad Wijaya",
        rating: 4.5,
      },
      bidCount: 5,
      endsAt: "2026-03-15T10:00:00Z",
    },
    {
      id: "listing-3",
      title: "Classic Watch",
      description: "Classic timepiece with leather strap",
      startingPrice: 300000,
      currentBid: 350000,
      category: "Accessories",
      condition: "Used",
      imageUrl: "https://example.com/classic-watch.jpg",
      status: "active",
      seller: {
        id: "user-3",
        name: "Siti Nurhaliza",
        rating: 4.9,
      },
      bidCount: 8,
      endsAt: "2026-03-16T10:00:00Z",
    },
  ] satisfies MockListingDTO[],
  mockCurrentUser: {
    id: "user-1",
    name: "Budi Santoso",
    role: "seller" as "buyer" | "seller",
  } satisfies MockCurrentUserDTO,
} as const;
