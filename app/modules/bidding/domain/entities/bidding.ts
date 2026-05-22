// Domain entities for the bidding module — pure types, no framework deps.

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

export type MyBidTimelineEntryType =
  | "BID_PLACED"
  | "BID_OUTBID"
  | "AUCTION_EXTENDED"
  | "AUCTION_CLOSED"
  | "AUCTION_WON"
  | "AUCTION_LOST"
  | string;

export interface Auction {
  readonly id: string;
  readonly listingId: string;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly startPrice: number;
  readonly currentPrice: number;
  readonly reservePrice: number | null;
  readonly bidIncrement: number;
  readonly bidCount: number;
  readonly status: AuctionStatus;
  readonly winnerId: string | null;
  readonly winnerName: string | null;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly originalEndsAt: string;
  readonly extensionCount: number;
  readonly createdAt: string;
  readonly highestBidderAlias: string;
  readonly myLatestBid: number | null;
}

export interface BidHistoryEntry {
  readonly id: string;
  readonly auctionId: string;
  readonly bidderId: string;
  readonly bidderAlias: string;
  readonly amount: number;
  readonly placedAt: string;
  readonly acceptedAt: string;
  readonly receivedSequence: number;
  readonly status: BidHistoryStatus;
  readonly isMyBid: boolean;
  readonly isProxy: boolean;
}

export interface AuctionHistory {
  readonly auction: Auction;
  readonly bids: BidHistoryEntry[];
  readonly ordering: {
    readonly primary: string;
    readonly secondary: string;
  };
}

export interface PlaceBidResult {
  readonly bidId: string;
  readonly auctionId: string;
  readonly currentPrice: number;
  readonly bidCount: number;
  readonly endsAt: string;
  readonly extended: boolean;
  readonly extensionCount: number;
  readonly minimumNextBid: number;
  readonly autoBidApplied: boolean;
  readonly effectiveWinnerId: string | null;
}

export interface ProxyBidStatus {
  readonly auctionId: string;
  readonly bidderId: string;
  readonly enabled: boolean;
  readonly maxAmount: number | null;
  readonly auctionStatus: string;
  readonly currentPrice: number;
  readonly minimumProxyAmount: number;
  readonly currentlyLeading: boolean;
  readonly updatedAt: string | null;
}

export interface DisableProxyBidResult {
  readonly auctionId: string;
  readonly bidderId: string;
  readonly disabled: boolean;
}

export interface MyBidListItem {
  readonly auctionId: string;
  readonly listingId: string;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly startPrice: number;
  readonly currentPrice: number;
  readonly reservePrice: number | null;
  readonly bidIncrement: number;
  readonly bidCount: number;
  readonly auctionStatus: AuctionStatus;
  readonly myBidStatus: MyBidStatus;
  readonly winnerId: string | null;
  readonly winnerName: string | null;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly originalEndsAt: string;
  readonly extensionCount: number;
  readonly highestBidderAlias: string;
  readonly myLatestBid: number;
  readonly lastBidAt: string;
  readonly isReserveMet: boolean;
}

export interface MyBidsOverview {
  readonly user: {
    readonly id: string;
    readonly name: string;
  };
  readonly bids: MyBidListItem[];
  readonly summary: Record<MyBidFilterValue, number>;
}

export interface MyBidTimelineEntry {
  readonly at: string;
  readonly type: MyBidTimelineEntryType;
  readonly amount: number | null;
  readonly note: string;
}

export interface MyBidDetail {
  readonly auction: Auction;
  readonly myLatestBid: number;
  readonly myBidStatus: MyBidStatus;
  readonly winningGap: number;
  readonly isReserveMet: boolean;
  readonly placedBidCount: number;
  readonly timeline: MyBidTimelineEntry[];
}
