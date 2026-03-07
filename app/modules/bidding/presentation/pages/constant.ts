// Inline DTO interfaces for bidding module mock payloads

interface PlaceBidRequestDTO {
  auctionId: string;
  amount: number;
}

interface PlaceBidResponseDTO {
  bidId: string;
  status: "accepted" | "outbid";
  newHighestBid: number;
}

interface GetAuctionDetailRequestDTO {
  auctionId: string;
}

interface BidDetailDTO {
  bidId: string;
  bidderId: string;
  amount: number;
  placedAt: string;
  bidderName: string;
}

interface GetAuctionDetailResponseDTO {
  id: string;
  title: string;
  currentBid: number;
  minIncrement: number;
  endsAt: string;
  bids: BidDetailDTO[];
  status: string;
  seller: {
    id: string;
    name: string;
  };
  description: string;
}

interface GetBidHistoryRequestDTO {
  auctionId: string;
}

interface GetBidHistoryResponseDTO {
  bids: Array<{
    bidId: string;
    bidderId: string;
    amount: number;
    placedAt: string;
    status: string;
  }>;
}

interface GetMyBidsRequestDTO {
  status?: string;
  page?: number;
}

interface GetMyBidsResponseDTO {
  bids: Array<{
    auctionId: string;
    title: string;
    myBid: number;
    highestBid: number;
    status: string;
    endsAt: string;
  }>;
  total: number;
}

interface GetBidDetailRequestDTO {
  auctionId: string;
}

interface GetBidDetailResponseDTO {
  id: string;
  title: string;
  currentBid: number;
  minIncrement: number;
  endsAt: string;
  bids: BidDetailDTO[];
  status: string;
  seller: {
    id: string;
    name: string;
  };
  description: string;
}

interface MockAuctionDTO {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  minIncrement: number;
  endsAt: string;
  bids: BidDetailDTO[];
  status: string;
  seller: {
    id: string;
    name: string;
  };
}

export const BIDDING_MOCK_PAYLOADS = {
  placeBid: {
    request: {
      auctionId: "auction-1",
      amount: 850000,
    } satisfies PlaceBidRequestDTO,
    response: {
      success: {
        bidId: "bid-1",
        status: "accepted" as const,
        newHighestBid: 850000,
      } satisfies PlaceBidResponseDTO,
      outbid: {
        bidId: "bid-2",
        status: "outbid" as const,
        newHighestBid: 900000,
      } satisfies PlaceBidResponseDTO,
    },
  },
  getAuctionDetail: {
    request: {
      auctionId: "auction-1",
    } satisfies GetAuctionDetailRequestDTO,
    response: {
      success: {
        id: "auction-1",
        title: "Vintage Watch",
        currentBid: 850000,
        minIncrement: 50000,
        endsAt: "2026-03-14T10:00:00Z",
        bids: [
          {
            bidId: "bid-1",
            bidderId: "user-2",
            amount: 750000,
            placedAt: "2026-03-10T08:00:00Z",
            bidderName: "Ahmad Wijaya",
          },
          {
            bidId: "bid-2",
            bidderId: "user-3",
            amount: 850000,
            placedAt: "2026-03-11T10:30:00Z",
            bidderName: "Siti Nurhaliza",
          },
        ],
        status: "active",
        seller: {
          id: "user-1",
          name: "Budi Santoso",
        },
        description: "Rare vintage watch from 1980s",
      } satisfies GetAuctionDetailResponseDTO,
    },
  },
  getBidHistory: {
    request: {
      auctionId: "auction-1",
    } satisfies GetBidHistoryRequestDTO,
    response: {
      success: {
        bids: [
          {
            bidId: "bid-1",
            bidderId: "user-2",
            amount: 750000,
            placedAt: "2026-03-10T08:00:00Z",
            status: "active",
          },
          {
            bidId: "bid-2",
            bidderId: "user-3",
            amount: 850000,
            placedAt: "2026-03-11T10:30:00Z",
            status: "active",
          },
        ],
      } satisfies GetBidHistoryResponseDTO,
    },
  },
  getMyBids: {
    request: {
      status: "active",
      page: 1,
    } satisfies GetMyBidsRequestDTO,
    response: {
      success: {
        bids: [
          {
            auctionId: "auction-1",
            title: "Vintage Watch",
            myBid: 850000,
            highestBid: 850000,
            status: "winning",
            endsAt: "2026-03-14T10:00:00Z",
          },
          {
            auctionId: "auction-2",
            title: "Digital Watch",
            myBid: 250000,
            highestBid: 300000,
            status: "outbid",
            endsAt: "2026-03-15T10:00:00Z",
          },
        ],
        total: 2,
      } satisfies GetMyBidsResponseDTO,
    },
  },
  getBidDetail: {
    request: {
      auctionId: "auction-1",
    } satisfies GetBidDetailRequestDTO,
    response: {
      success: {
        id: "auction-1",
        title: "Vintage Watch",
        currentBid: 850000,
        minIncrement: 50000,
        endsAt: "2026-03-14T10:00:00Z",
        bids: [
          {
            bidId: "bid-1",
            bidderId: "user-2",
            amount: 750000,
            placedAt: "2026-03-10T08:00:00Z",
            bidderName: "Ahmad Wijaya",
          },
          {
            bidId: "bid-2",
            bidderId: "user-3",
            amount: 850000,
            placedAt: "2026-03-11T10:30:00Z",
            bidderName: "Siti Nurhaliza",
          },
        ],
        status: "active",
        seller: {
          id: "user-1",
          name: "Budi Santoso",
        },
        description: "Rare vintage watch from 1980s",
      } satisfies GetBidDetailResponseDTO,
    },
  },
  mockAuction: {
    id: "auction-1",
    title: "Vintage Watch",
    description: "Rare vintage watch from 1980s",
    currentBid: 850000,
    minIncrement: 50000,
    endsAt: "2026-03-14T10:00:00Z",
    bids: [
      {
        bidId: "bid-1",
        bidderId: "user-2",
        amount: 750000,
        placedAt: "2026-03-10T08:00:00Z",
        bidderName: "Ahmad Wijaya",
      },
      {
        bidId: "bid-2",
        bidderId: "user-3",
        amount: 850000,
        placedAt: "2026-03-11T10:30:00Z",
        bidderName: "Siti Nurhaliza",
      },
    ],
    status: "active",
    seller: {
      id: "user-1",
      name: "Budi Santoso",
    },
  } satisfies MockAuctionDTO,
} as const;
