// View-model types used only by `bidding-detail-page.tsx` to project the
// combined `MyBidDetail` + `AuctionHistory` payload into a single shape.
// Wire shapes live in `~/modules/bidding/domain/entities/bidding`.

import type {
  AuctionStatus as DomainAuctionStatus,
  MyBidStatus as DomainMyBidStatus,
} from "~/modules/bidding/domain/entities/bidding";

export type AuctionStatus = DomainAuctionStatus;
export type MyBidStatus = DomainMyBidStatus;

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
