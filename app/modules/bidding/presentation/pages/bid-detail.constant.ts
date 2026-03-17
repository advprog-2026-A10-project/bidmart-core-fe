export type AuctionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "EXTENDED"
  | "CLOSED"
  | "WON"
  | "UNSOLD";

export type MyBidStatus = "WINNING" | "OUTBID" | "WON" | "LOST";

export type BidActivityType =
  | "PLACED_BID"
  | "OUTBID"
  | "LEADING"
  | "EXTENDED"
  | "CLOSED"
  | "RESULT_CONFIRMED";

export interface AuctionRecord {
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
  currency: "IDR";
  highestBidderAlias: string;
}

export interface BidActivity {
  id: string;
  type: BidActivityType;
  actorId: string | null;
  actorName: string;
  amount: number | null;
  at: string;
  note: string;
  isMyAction: boolean;
}

export interface BidHistoryPreviewItem {
  id: string;
  bidderAlias: string;
  amount: number;
  acceptedAt: string;
  isMyBid: boolean;
}

export interface BidDetail {
  auction: AuctionRecord;
  myBidStatus: MyBidStatus;
  myLatestBid: number;
  myHighestBid: number;
  myBidCount: number;
  myLastBidAt: string;
  myRank: number | null;
  isReserveMet: boolean;
  minimumNextBid: number | null;
  canBidAgain: boolean;
  winningGap: number;
  summary: {
    headline: string;
    body: string;
  };
  historyPreview: BidHistoryPreviewItem[];
  activities: BidActivity[];
}

interface GetBidDetailRequest {
  userId: string;
  auctionId: string;
}

interface GetBidDetailResponse {
  detail: BidDetail;
}

const now = Date.now();

function minutesFromNow(minutes: number) {
  return new Date(now + minutes * 60 * 1000).toISOString();
}

function hoursFromNow(hours: number) {
  return new Date(now + hours * 60 * 60 * 1000).toISOString();
}

function daysFromNow(days: number) {
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
}

const bidDetails: Record<string, BidDetail> = {
  "auction-1": {
    auction: {
      id: "auction-1",
      listingId: "listing-1",
      sellerId: "seller-18",
      sellerName: "Vintage Optics Studio",
      title: "Leica M6 Classic Rangefinder",
      description:
        "Collector-grade Leica M6 in very good condition with original strap, body cap, and box. The current session is a real-time English auction: every new bid must beat the current highest price by at least the configured increment, and anti-sniping will extend the closing time by two minutes when a valid bid lands near the end.",
      imageUrl:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      startPrice: 12000000,
      currentPrice: 15500000,
      reservePrice: 16000000,
      bidIncrement: 250000,
      bidCount: 14,
      status: "ACTIVE",
      winnerId: null,
      winnerName: null,
      startsAt: minutesFromNow(-18),
      endsAt: minutesFromNow(2),
      originalEndsAt: minutesFromNow(0),
      extensionCount: 1,
      createdAt: daysFromNow(-2),
      currency: "IDR",
      highestBidderAlias: "Bidder #4",
    },
    myBidStatus: "OUTBID",
    myLatestBid: 15250000,
    myHighestBid: 15250000,
    myBidCount: 3,
    myLastBidAt: minutesFromNow(-1),
    myRank: 2,
    isReserveMet: false,
    minimumNextBid: 15750000,
    canBidAgain: true,
    winningGap: 250000,
    summary: {
      headline: "You were outbid in the final stretch.",
      body: "Your latest accepted bid was Rp15.250.000, but another participant reached Rp15.500.000 immediately after. Because the competing bid arrived near the deadline, the auction end time was automatically extended by two minutes.",
    },
    historyPreview: [
      {
        id: "h-1",
        bidderAlias: "Bidder #11",
        amount: 15000000,
        acceptedAt: minutesFromNow(-2),
        isMyBid: false,
      },
      {
        id: "h-2",
        bidderAlias: "You",
        amount: 15250000,
        acceptedAt: minutesFromNow(-1),
        isMyBid: true,
      },
      {
        id: "h-3",
        bidderAlias: "Bidder #4",
        amount: 15500000,
        acceptedAt: minutesFromNow(-1),
        isMyBid: false,
      },
    ],
    activities: [
      {
        id: "a-1",
        type: "PLACED_BID",
        actorId: "buyer-me",
        actorName: "You",
        amount: 15250000,
        at: minutesFromNow(-1),
        note: "Your bid met the minimum increment and was accepted by the auction engine.",
        isMyAction: true,
      },
      {
        id: "a-2",
        type: "OUTBID",
        actorId: "buyer-4",
        actorName: "Bidder #4",
        amount: 15500000,
        at: minutesFromNow(-1),
        note: "A competing bid arrived moments later and moved you to second place.",
        isMyAction: false,
      },
      {
        id: "a-3",
        type: "EXTENDED",
        actorId: null,
        actorName: "System",
        amount: null,
        at: minutesFromNow(-1),
        note: "Anti-sniping triggered: the auction end time was extended by 2 minutes.",
        isMyAction: false,
      },
      {
        id: "a-4",
        type: "LEADING",
        actorId: "buyer-4",
        actorName: "Bidder #4",
        amount: 15500000,
        at: minutesFromNow(-1),
        note: "Current highest accepted bid.",
        isMyAction: false,
      },
    ],
  },
  "auction-2": {
    auction: {
      id: "auction-2",
      listingId: "listing-2",
      sellerId: "seller-04",
      sellerName: "Horology House",
      title: "Rolex Datejust 36 Silver Dial",
      description:
        "A live luxury watch auction with verified condition report and reserve price already met. The lot has been extended once and your bid currently sits on top.",
      imageUrl:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
      startPrice: 58000000,
      currentPrice: 63500000,
      reservePrice: 62000000,
      bidIncrement: 500000,
      bidCount: 18,
      status: "EXTENDED",
      winnerId: null,
      winnerName: null,
      startsAt: minutesFromNow(-55),
      endsAt: minutesFromNow(7),
      originalEndsAt: minutesFromNow(5),
      extensionCount: 1,
      createdAt: daysFromNow(-3),
      currency: "IDR",
      highestBidderAlias: "You",
    },
    myBidStatus: "WINNING",
    myLatestBid: 63500000,
    myHighestBid: 63500000,
    myBidCount: 4,
    myLastBidAt: minutesFromNow(-3),
    myRank: 1,
    isReserveMet: true,
    minimumNextBid: 64000000,
    canBidAgain: true,
    winningGap: 0,
    summary: {
      headline: "You are currently leading this auction.",
      body: "Your latest accepted bid matches the current highest price. The reserve has been met, and the lot will close in your favor if no higher accepted bid arrives before the extended deadline.",
    },
    historyPreview: [
      {
        id: "h-4",
        bidderAlias: "Bidder #6",
        amount: 63000000,
        acceptedAt: minutesFromNow(-4),
        isMyBid: false,
      },
      {
        id: "h-5",
        bidderAlias: "You",
        amount: 63500000,
        acceptedAt: minutesFromNow(-3),
        isMyBid: true,
      },
    ],
    activities: [
      {
        id: "a-5",
        type: "PLACED_BID",
        actorId: "buyer-me",
        actorName: "You",
        amount: 63500000,
        at: minutesFromNow(-3),
        note: "Accepted bid. You cleared the required increment and took the lead.",
        isMyAction: true,
      },
      {
        id: "a-6",
        type: "LEADING",
        actorId: "buyer-me",
        actorName: "You",
        amount: 63500000,
        at: minutesFromNow(-3),
        note: "You currently hold the highest accepted bid.",
        isMyAction: true,
      },
      {
        id: "a-7",
        type: "EXTENDED",
        actorId: null,
        actorName: "System",
        amount: null,
        at: minutesFromNow(-3),
        note: "The close was extended after a valid bid landed within the anti-sniping window.",
        isMyAction: false,
      },
    ],
  },
  "auction-3": {
    auction: {
      id: "auction-3",
      listingId: "listing-3",
      sellerId: "seller-09",
      sellerName: "Audio Archive",
      title: "Sony TPS-L2 Walkman First Generation",
      description:
        "A collectible first-generation Walkman with original case and documentation. Auction has closed and the winning result was confirmed.",
      imageUrl:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      startPrice: 6500000,
      currentPrice: 9100000,
      reservePrice: 8000000,
      bidIncrement: 100000,
      bidCount: 22,
      status: "WON",
      winnerId: "buyer-me",
      winnerName: "Budi Santoso",
      startsAt: daysFromNow(-3),
      endsAt: hoursFromNow(-18),
      originalEndsAt: hoursFromNow(-18),
      extensionCount: 0,
      createdAt: daysFromNow(-6),
      currency: "IDR",
      highestBidderAlias: "You",
    },
    myBidStatus: "WON",
    myLatestBid: 9100000,
    myHighestBid: 9100000,
    myBidCount: 5,
    myLastBidAt: hoursFromNow(-19),
    myRank: 1,
    isReserveMet: true,
    minimumNextBid: null,
    canBidAgain: false,
    winningGap: 0,
    summary: {
      headline: "You won this auction.",
      body: "Your last accepted bid became the final winning price when the auction closed. Reserve was met, and the winner information has already been confirmed.",
    },
    historyPreview: [
      {
        id: "h-6",
        bidderAlias: "Bidder #8",
        amount: 9000000,
        acceptedAt: hoursFromNow(-20),
        isMyBid: false,
      },
      {
        id: "h-7",
        bidderAlias: "You",
        amount: 9100000,
        acceptedAt: hoursFromNow(-19),
        isMyBid: true,
      },
    ],
    activities: [
      {
        id: "a-8",
        type: "PLACED_BID",
        actorId: "buyer-me",
        actorName: "You",
        amount: 9100000,
        at: hoursFromNow(-19),
        note: "Final accepted bid before the auction closed.",
        isMyAction: true,
      },
      {
        id: "a-9",
        type: "CLOSED",
        actorId: null,
        actorName: "System",
        amount: 9100000,
        at: hoursFromNow(-18),
        note: "Auction closed with your bid on top.",
        isMyAction: false,
      },
      {
        id: "a-10",
        type: "RESULT_CONFIRMED",
        actorId: null,
        actorName: "System",
        amount: 9100000,
        at: hoursFromNow(-18),
        note: "Winning result confirmed for Budi Santoso.",
        isMyAction: false,
      },
    ],
  },
  "auction-4": {
    auction: {
      id: "auction-4",
      listingId: "listing-4",
      sellerId: "seller-11",
      sellerName: "Marine Timepieces",
      title: "Omega Seamaster Diver 300M",
      description:
        "A well-kept Seamaster Diver 300M with full bracelet and box set. The auction has closed and another bidder finished above your last offer.",
      imageUrl:
        "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80",
      startPrice: 42000000,
      currentPrice: 48750000,
      reservePrice: 47000000,
      bidIncrement: 250000,
      bidCount: 31,
      status: "WON",
      winnerId: "buyer-21",
      winnerName: "Bidder #21",
      startsAt: daysFromNow(-6),
      endsAt: daysFromNow(-2),
      originalEndsAt: daysFromNow(-2),
      extensionCount: 0,
      createdAt: daysFromNow(-10),
      currency: "IDR",
      highestBidderAlias: "Bidder #21",
    },
    myBidStatus: "LOST",
    myLatestBid: 48250000,
    myHighestBid: 48250000,
    myBidCount: 2,
    myLastBidAt: daysFromNow(-2.02),
    myRank: 2,
    isReserveMet: true,
    minimumNextBid: null,
    canBidAgain: false,
    winningGap: 500000,
    summary: {
      headline: "You lost this auction.",
      body: "Your best accepted bid finished below the final winning amount. The auction closed with reserve met and another bidder confirmed as the winner.",
    },
    historyPreview: [
      {
        id: "h-8",
        bidderAlias: "You",
        amount: 48250000,
        acceptedAt: daysFromNow(-2.02),
        isMyBid: true,
      },
      {
        id: "h-9",
        bidderAlias: "Bidder #21",
        amount: 48750000,
        acceptedAt: daysFromNow(-2.01),
        isMyBid: false,
      },
    ],
    activities: [
      {
        id: "a-11",
        type: "PLACED_BID",
        actorId: "buyer-me",
        actorName: "You",
        amount: 48250000,
        at: daysFromNow(-2.02),
        note: "Your final accepted bid before closing.",
        isMyAction: true,
      },
      {
        id: "a-12",
        type: "OUTBID",
        actorId: "buyer-21",
        actorName: "Bidder #21",
        amount: 48750000,
        at: daysFromNow(-2.01),
        note: "Another bidder cleared the next increment and overtook your offer.",
        isMyAction: false,
      },
      {
        id: "a-13",
        type: "CLOSED",
        actorId: null,
        actorName: "System",
        amount: 48750000,
        at: daysFromNow(-2),
        note: "Auction closed with Bidder #21 on top.",
        isMyAction: false,
      },
      {
        id: "a-14",
        type: "RESULT_CONFIRMED",
        actorId: null,
        actorName: "System",
        amount: 48750000,
        at: daysFromNow(-2),
        note: "Winning result confirmed for Bidder #21.",
        isMyAction: false,
      },
    ],
  },
  "auction-5": {
    auction: {
      id: "auction-5",
      listingId: "listing-5",
      sellerId: "seller-07",
      sellerName: "Design Atelier",
      title: "Herman Miller Eames Lounge Chair",
      description:
        "A premium lounge chair lot that attracted bidding but ultimately failed to meet the seller's reserve price.",
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      startPrice: 21000000,
      currentPrice: 24800000,
      reservePrice: 26000000,
      bidIncrement: 200000,
      bidCount: 12,
      status: "UNSOLD",
      winnerId: null,
      winnerName: null,
      startsAt: daysFromNow(-4),
      endsAt: hoursFromNow(-22),
      originalEndsAt: hoursFromNow(-22),
      extensionCount: 0,
      createdAt: daysFromNow(-8),
      currency: "IDR",
      highestBidderAlias: "Bidder #14",
    },
    myBidStatus: "LOST",
    myLatestBid: 24600000,
    myHighestBid: 24600000,
    myBidCount: 2,
    myLastBidAt: hoursFromNow(-23),
    myRank: 2,
    isReserveMet: false,
    minimumNextBid: null,
    canBidAgain: false,
    winningGap: 200000,
    summary: {
      headline: "Auction ended unsold.",
      body: "Even though there was a higher bid than yours at close, the final accepted price never reached reserve. The lot was marked unsold, so no winner was created.",
    },
    historyPreview: [
      {
        id: "h-10",
        bidderAlias: "You",
        amount: 24600000,
        acceptedAt: hoursFromNow(-23),
        isMyBid: true,
      },
      {
        id: "h-11",
        bidderAlias: "Bidder #14",
        amount: 24800000,
        acceptedAt: hoursFromNow(-22.5),
        isMyBid: false,
      },
    ],
    activities: [
      {
        id: "a-15",
        type: "PLACED_BID",
        actorId: "buyer-me",
        actorName: "You",
        amount: 24600000,
        at: hoursFromNow(-23),
        note: "Your latest accepted bid before closing.",
        isMyAction: true,
      },
      {
        id: "a-16",
        type: "OUTBID",
        actorId: "buyer-14",
        actorName: "Bidder #14",
        amount: 24800000,
        at: hoursFromNow(-22.5),
        note: "A competing bid overtook yours shortly before close.",
        isMyAction: false,
      },
      {
        id: "a-17",
        type: "CLOSED",
        actorId: null,
        actorName: "System",
        amount: 24800000,
        at: hoursFromNow(-22),
        note: "Auction closed below reserve price.",
        isMyAction: false,
      },
      {
        id: "a-18",
        type: "RESULT_CONFIRMED",
        actorId: null,
        actorName: "System",
        amount: null,
        at: hoursFromNow(-22),
        note: "Result confirmed as unsold. No winner assigned.",
        isMyAction: false,
      },
    ],
  },
};

export const BIDDING_MOCK_PAYLOADS = {
  currentUser: {
    id: "buyer-me",
    name: "Budi Santoso",
  },
  getBidDetail: {
    request: {
      userId: "buyer-me",
      auctionId: "auction-1",
    } satisfies GetBidDetailRequest,
    response: {
      detail: bidDetails["auction-1"],
    } satisfies GetBidDetailResponse,
    byAuctionId: bidDetails,
  },
};
