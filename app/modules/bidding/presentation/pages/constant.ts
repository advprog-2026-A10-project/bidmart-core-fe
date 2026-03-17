export type AuctionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "EXTENDED"
  | "CLOSED"
  | "WON"
  | "UNSOLD";

export type BidHistoryStatus = "LEADING" | "OUTBID";
export type MyBidStatus = "WINNING" | "OUTBID" | "WON" | "LOST";
export type MyBidFilterValue = "all" | "winning" | "outbid" | "won" | "lost";

export interface AuctionDetail {
  id: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  imageUrl: string;
  startPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  bidIncrement: number;
  bidCount: number;
  status: AuctionStatus;
  winnerId: string | null;
  winnerName: string | null;
  startsAt: string;
  endsAt: string;
  originalEndsAt: string;
  extensionCount: number;
  createdAt: string;
  watchersCount: number;
  highestBidderAlias: string;
  myLatestBid: number | null;
  currency: "IDR";
}

export interface BidHistoryEntry {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderAlias: string;
  amount: number;
  placedAt: string;
  acceptedAt: string;
  receivedSequence: number;
  status: BidHistoryStatus;
  isMyBid: boolean;
}

export interface MyBidListItem {
  auctionId: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  imageUrl: string;
  startPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  bidIncrement: number;
  bidCount: number;
  auctionStatus: AuctionStatus;
  myBidStatus: MyBidStatus;
  winnerId: string | null;
  winnerName: string | null;
  startsAt: string;
  endsAt: string;
  originalEndsAt: string;
  extensionCount: number;
  highestBidderAlias: string;
  myLatestBid: number;
  lastBidAt: string;
  isReserveMet: boolean;
  currency: "IDR";
}

interface GetAuctionDetailRequest {
  auctionId: string;
}

interface GetAuctionDetailResponse {
  auction: AuctionDetail;
}

interface PlaceBidRequest {
  auctionId: string;
  amount: number;
}

interface PlaceBidResponse {
  accepted: boolean;
  amount: number;
  placedAt: string;
  willExtend: boolean;
}

interface GetAuctionHistoryRequest {
  auctionId: string;
}

interface GetAuctionHistoryResponse {
  auction: AuctionDetail;
  bids: BidHistoryEntry[];
  ordering: {
    primary: "acceptedAt";
    secondary: "receivedSequence";
    direction: "desc";
  };
}

interface GetMyBidsRequest {
  userId: string;
  status?: Exclude<MyBidFilterValue, "all">;
}

interface GetMyBidsResponse {
  user: {
    id: string;
    name: string;
  };
  bids: MyBidListItem[];
  summary: Record<MyBidFilterValue, number>;
}

const now = Date.now();
const startsAt = new Date(now - 12 * 60 * 1000).toISOString();
const endsAt = new Date(now + 95 * 1000).toISOString();

const historySeed = [
  {
    bidderId: "buyer-1",
    bidderAlias: "Bidder #1",
    amount: 12250000,
    offsetMs: -11 * 60 * 1000,
    acceptedOffsetMs: -11 * 60 * 1000 + 180,
    sequence: 1,
    isMyBid: false,
  },
  {
    bidderId: "buyer-2",
    bidderAlias: "Bidder #2",
    amount: 12500000,
    offsetMs: -10 * 60 * 1000,
    acceptedOffsetMs: -10 * 60 * 1000 + 160,
    sequence: 2,
    isMyBid: false,
  },
  {
    bidderId: "buyer-3",
    bidderAlias: "Bidder #3",
    amount: 12750000,
    offsetMs: -9 * 60 * 1000,
    acceptedOffsetMs: -9 * 60 * 1000 + 190,
    sequence: 3,
    isMyBid: false,
  },
  {
    bidderId: "buyer-4",
    bidderAlias: "Bidder #4",
    amount: 13000000,
    offsetMs: -8 * 60 * 1000,
    acceptedOffsetMs: -8 * 60 * 1000 + 210,
    sequence: 4,
    isMyBid: false,
  },
  {
    bidderId: "buyer-5",
    bidderAlias: "Bidder #5",
    amount: 13250000,
    offsetMs: -7 * 60 * 1000,
    acceptedOffsetMs: -7 * 60 * 1000 + 225,
    sequence: 5,
    isMyBid: false,
  },
  {
    bidderId: "buyer-1",
    bidderAlias: "Bidder #1",
    amount: 13500000,
    offsetMs: -6 * 60 * 1000,
    acceptedOffsetMs: -6 * 60 * 1000 + 160,
    sequence: 6,
    isMyBid: false,
  },
  {
    bidderId: "buyer-6",
    bidderAlias: "Bidder #6",
    amount: 13750000,
    offsetMs: -5 * 60 * 1000,
    acceptedOffsetMs: -5 * 60 * 1000 + 145,
    sequence: 7,
    isMyBid: false,
  },
  {
    bidderId: "buyer-7",
    bidderAlias: "Bidder #7",
    amount: 14000000,
    offsetMs: -4 * 60 * 1000,
    acceptedOffsetMs: -4 * 60 * 1000 + 175,
    sequence: 8,
    isMyBid: false,
  },
  {
    bidderId: "buyer-8",
    bidderAlias: "Bidder #8",
    amount: 14250000,
    offsetMs: -3 * 60 * 1000,
    acceptedOffsetMs: -3 * 60 * 1000 + 180,
    sequence: 9,
    isMyBid: false,
  },
  {
    bidderId: "buyer-9",
    bidderAlias: "Bidder #9",
    amount: 14500000,
    offsetMs: -2 * 60 * 1000,
    acceptedOffsetMs: -2 * 60 * 1000 + 210,
    sequence: 10,
    isMyBid: false,
  },
  {
    bidderId: "buyer-10",
    bidderAlias: "Bidder #10",
    amount: 14750000,
    offsetMs: -90 * 1000,
    acceptedOffsetMs: -90 * 1000 + 185,
    sequence: 11,
    isMyBid: false,
  },
  {
    bidderId: "buyer-11",
    bidderAlias: "Bidder #11",
    amount: 15000000,
    offsetMs: -78 * 1000,
    acceptedOffsetMs: -78 * 1000 + 185,
    sequence: 12,
    isMyBid: false,
  },
  {
    bidderId: "buyer-me",
    bidderAlias: "You",
    amount: 15250000,
    offsetMs: -42 * 1000,
    acceptedOffsetMs: -41 * 1000,
    sequence: 13,
    isMyBid: true,
  },
  {
    bidderId: "buyer-4",
    bidderAlias: "Bidder #4",
    amount: 15500000,
    offsetMs: -41 * 1000,
    acceptedOffsetMs: -41 * 1000,
    sequence: 14,
    isMyBid: false,
  },
] as const;

const mockBidHistory = historySeed.map((entry, index) => ({
  id: `bid-${entry.sequence}`,
  auctionId: "auction-1",
  bidderId: entry.bidderId,
  bidderAlias: entry.bidderAlias,
  amount: entry.amount,
  placedAt: new Date(now + entry.offsetMs).toISOString(),
  acceptedAt: new Date(now + entry.acceptedOffsetMs).toISOString(),
  receivedSequence: entry.sequence,
  status: index === historySeed.length - 1 ? "LEADING" : "OUTBID",
  isMyBid: entry.isMyBid,
})) satisfies BidHistoryEntry[];

const mockMyBids = [
  {
    auctionId: "auction-1",
    listingId: "listing-1",
    sellerId: "seller-18",
    sellerName: "Vintage Optics Studio",
    title: "Leica M6 Classic Rangefinder",
    description:
      "You were leading briefly, but another bidder overtook your latest bid during the live session.",
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    startPrice: 12000000,
    currentPrice: 15500000,
    reservePrice: 16000000,
    bidIncrement: 250000,
    bidCount: mockBidHistory.length,
    auctionStatus: "ACTIVE" as const,
    myBidStatus: "OUTBID" as const,
    winnerId: null,
    winnerName: null,
    startsAt: new Date(now - 12 * 60 * 1000).toISOString(),
    endsAt: new Date(now + 95 * 1000).toISOString(),
    originalEndsAt: new Date(now + 30 * 1000).toISOString(),
    extensionCount: 1,
    highestBidderAlias: "Bidder #4",
    myLatestBid: 15250000,
    lastBidAt: new Date(now - 41 * 1000).toISOString(),
    isReserveMet: false,
    currency: "IDR" as const,
  },
  {
    auctionId: "auction-2",
    listingId: "listing-2",
    sellerId: "seller-04",
    sellerName: "Horology House",
    title: "Rolex Datejust 36 Silver Dial",
    description:
      "You currently hold the highest bid. The auction has already been extended once because of a late bid.",
    imageUrl:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
    startPrice: 58000000,
    currentPrice: 63500000,
    reservePrice: 62000000,
    bidIncrement: 500000,
    bidCount: 18,
    auctionStatus: "EXTENDED" as const,
    myBidStatus: "WINNING" as const,
    winnerId: null,
    winnerName: null,
    startsAt: new Date(now - 45 * 60 * 1000).toISOString(),
    endsAt: new Date(now + 7 * 60 * 1000).toISOString(),
    originalEndsAt: new Date(now + 5 * 60 * 1000).toISOString(),
    extensionCount: 1,
    highestBidderAlias: "You",
    myLatestBid: 63500000,
    lastBidAt: new Date(now - 3 * 60 * 1000).toISOString(),
    isReserveMet: true,
    currency: "IDR" as const,
  },
  {
    auctionId: "auction-3",
    listingId: "listing-3",
    sellerId: "seller-09",
    sellerName: "Audio Archive",
    title: "Sony TPS-L2 Walkman First Generation",
    description:
      "The auction closed and you won. Reserve was met and the seller confirmed the winning result.",
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    startPrice: 6500000,
    currentPrice: 9100000,
    reservePrice: 8000000,
    bidIncrement: 100000,
    bidCount: 22,
    auctionStatus: "WON" as const,
    myBidStatus: "WON" as const,
    winnerId: "buyer-me",
    winnerName: "Budi Santoso",
    startsAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
    originalEndsAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
    extensionCount: 0,
    highestBidderAlias: "You",
    myLatestBid: 9100000,
    lastBidAt: new Date(now - 19 * 60 * 60 * 1000).toISOString(),
    isReserveMet: true,
    currency: "IDR" as const,
  },
  {
    auctionId: "auction-4",
    listingId: "listing-4",
    sellerId: "seller-11",
    sellerName: "Marine Timepieces",
    title: "Omega Seamaster Diver 300M",
    description:
      "The auction closed with another bidder on top. Your final bid remained below the winning amount.",
    imageUrl:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80",
    startPrice: 42000000,
    currentPrice: 48750000,
    reservePrice: 47000000,
    bidIncrement: 250000,
    bidCount: 31,
    auctionStatus: "WON" as const,
    myBidStatus: "LOST" as const,
    winnerId: "buyer-21",
    winnerName: "Bidder #21",
    startsAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    originalEndsAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    extensionCount: 0,
    highestBidderAlias: "Bidder #21",
    myLatestBid: 48250000,
    lastBidAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 1000).toISOString(),
    isReserveMet: true,
    currency: "IDR" as const,
  },
  {
    auctionId: "auction-5",
    listingId: "listing-5",
    sellerId: "seller-07",
    sellerName: "Design Atelier",
    title: "Herman Miller Eames Lounge Chair",
    description:
      "The auction ended without meeting reserve, so the lot remained unsold even though you participated.",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    startPrice: 21000000,
    currentPrice: 24800000,
    reservePrice: 26000000,
    bidIncrement: 200000,
    bidCount: 12,
    auctionStatus: "UNSOLD" as const,
    myBidStatus: "LOST" as const,
    winnerId: null,
    winnerName: null,
    startsAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(now - 22 * 60 * 60 * 1000).toISOString(),
    originalEndsAt: new Date(now - 22 * 60 * 60 * 1000).toISOString(),
    extensionCount: 0,
    highestBidderAlias: "Bidder #14",
    myLatestBid: 24600000,
    lastBidAt: new Date(now - 23 * 60 * 60 * 1000).toISOString(),
    isReserveMet: false,
    currency: "IDR" as const,
  },
] satisfies MyBidListItem[];

const myBidSummary: Record<MyBidFilterValue, number> = {
  all: mockMyBids.length,
  winning: mockMyBids.filter((bid) => bid.myBidStatus === "WINNING").length,
  outbid: mockMyBids.filter((bid) => bid.myBidStatus === "OUTBID").length,
  won: mockMyBids.filter((bid) => bid.myBidStatus === "WON").length,
  lost: mockMyBids.filter((bid) => bid.myBidStatus === "LOST").length,
};

export const BIDDING_MOCK_PAYLOADS = {
  currentUser: {
    id: "buyer-me",
    name: "Budi Santoso",
  },
  getAuctionDetail: {
    request: {
      auctionId: "auction-1",
    } satisfies GetAuctionDetailRequest,
    response: {
      auction: {
        id: "auction-1",
        listingId: "listing-1",
        sellerId: "seller-18",
        sellerName: "Vintage Optics Studio",
        title: "Leica M6 Classic Rangefinder",
        description:
          "Collector-grade Leica M6 in very good condition with original strap, body cap, and box. The camera has a clean rangefinder patch, smooth winding, and visible signs of careful ownership. This lot is configured as a live English auction with increment enforcement and anti-sniping extension.",
        imageUrl:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
        startPrice: 12000000,
        currentPrice: 15500000,
        reservePrice: 16000000,
        bidIncrement: 250000,
        bidCount: mockBidHistory.length,
        status: "ACTIVE" as const,
        winnerId: null,
        winnerName: null,
        startsAt,
        endsAt,
        originalEndsAt: endsAt,
        extensionCount: 1,
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        watchersCount: 23,
        highestBidderAlias: "Bidder #4",
        myLatestBid: 15250000,
        currency: "IDR" as const,
      } satisfies AuctionDetail,
    } satisfies GetAuctionDetailResponse,
  },
  getAuctionHistory: {
    request: {
      auctionId: "auction-1",
    } satisfies GetAuctionHistoryRequest,
    response: {
      auction: {
        id: "auction-1",
        listingId: "listing-1",
        sellerId: "seller-18",
        sellerName: "Vintage Optics Studio",
        title: "Leica M6 Classic Rangefinder",
        description:
          "Collector-grade Leica M6 in very good condition with original strap, body cap, and box. The camera has a clean rangefinder patch, smooth winding, and visible signs of careful ownership. This lot is configured as a live English auction with increment enforcement and anti-sniping extension.",
        imageUrl:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
        startPrice: 12000000,
        currentPrice: 15500000,
        reservePrice: 16000000,
        bidIncrement: 250000,
        bidCount: mockBidHistory.length,
        status: "ACTIVE" as const,
        winnerId: null,
        winnerName: null,
        startsAt,
        endsAt,
        originalEndsAt: endsAt,
        extensionCount: 1,
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        watchersCount: 23,
        highestBidderAlias: "Bidder #4",
        myLatestBid: 15250000,
        currency: "IDR" as const,
      } satisfies AuctionDetail,
      bids: mockBidHistory,
      ordering: {
        primary: "acceptedAt" as const,
        secondary: "receivedSequence" as const,
        direction: "desc" as const,
      },
    } satisfies GetAuctionHistoryResponse,
  },
  getMyBids: {
    request: {
      userId: "buyer-me",
    } satisfies GetMyBidsRequest,
    response: {
      user: {
        id: "buyer-me",
        name: "Budi Santoso",
      },
      bids: mockMyBids,
      summary: myBidSummary,
    } satisfies GetMyBidsResponse,
  },
  placeBid: {
    request: {
      auctionId: "auction-1",
      amount: 15750000,
    } satisfies PlaceBidRequest,
    response: {
      accepted: true,
      amount: 15750000,
      placedAt: new Date(now).toISOString(),
      willExtend: true,
    } satisfies PlaceBidResponse,
  },
  mockAuction: {
    id: "auction-1",
    listingId: "listing-1",
    sellerId: "seller-18",
    sellerName: "Vintage Optics Studio",
    title: "Leica M6 Classic Rangefinder",
    description:
      "Collector-grade Leica M6 in very good condition with original strap, body cap, and box. The camera has a clean rangefinder patch, smooth winding, and visible signs of careful ownership. This lot is configured as a live English auction with increment enforcement and anti-sniping extension.",
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    startPrice: 12000000,
    currentPrice: 15500000,
    reservePrice: 16000000,
    bidIncrement: 250000,
    bidCount: mockBidHistory.length,
    status: "ACTIVE" as const,
    winnerId: null,
    winnerName: null,
    startsAt,
    endsAt,
    originalEndsAt: endsAt,
    extensionCount: 1,
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    watchersCount: 23,
    highestBidderAlias: "Bidder #4",
    myLatestBid: 15250000,
    currency: "IDR" as const,
  } satisfies AuctionDetail,
  mockBidHistory,
  mockMyBids,
} as const;
