import type {
  Auction,
  AuctionHistory,
  BidHistoryEntry,
  DisableProxyBidResult,
  MyBidDetail,
  MyBidListItem,
  MyBidTimelineEntry,
  MyBidsOverview,
  PlaceBidResult,
  ProxyBidStatus,
} from "~/modules/bidding/domain/entities/bidding";
import type {
  AuctionApi,
  AuctionHistoryApi,
  BidHistoryEntryApi,
  DisableProxyBidApi,
  MyBidDetailApi,
  MyBidListItemApi,
  MyBidTimelineEntryApi,
  MyBidsOverviewApi,
  PlaceBidResultApi,
  ProxyBidStatusApi,
} from "./schemas";

const NO_LEADING_BIDDER_LABEL = "No bids yet";

export class BiddingApiMapper {
  static toAuction(raw: AuctionApi): Auction {
    return {
      id: raw.id,
      listingId: raw.listingId,
      sellerId: raw.sellerId,
      sellerName: raw.sellerName,
      title: raw.title,
      description: raw.description,
      imageUrl: raw.imageUrl,
      startPrice: raw.startPrice,
      currentPrice: raw.currentPrice,
      reservePrice: raw.reservePrice,
      bidIncrement: raw.bidIncrement,
      bidCount: raw.bidCount,
      status: raw.status,
      winnerId: raw.winnerId,
      winnerName: raw.winnerName,
      startsAt: raw.startsAt,
      endsAt: raw.endsAt,
      originalEndsAt: raw.originalEndsAt,
      extensionCount: raw.extensionCount,
      createdAt: raw.createdAt,
      highestBidderAlias: raw.highestBidderAlias ?? NO_LEADING_BIDDER_LABEL,
      myLatestBid: raw.myLatestBid ?? null,
    };
  }

  static toBidHistoryEntry(raw: BidHistoryEntryApi): BidHistoryEntry {
    return {
      id: raw.id,
      auctionId: raw.auctionId,
      bidderId: raw.bidderId,
      bidderAlias: raw.bidderName,
      amount: raw.amount,
      placedAt: raw.acceptedAt,
      acceptedAt: raw.acceptedAt,
      receivedSequence: raw.receivedSequence,
      status: raw.status,
      isMyBid: raw.isMyBid,
      isProxy: raw.isProxy ?? false,
    };
  }

  static toAuctionHistory(raw: AuctionHistoryApi): AuctionHistory {
    return {
      auction: BiddingApiMapper.toAuction(raw.auction),
      bids: raw.bids.map((bid) => BiddingApiMapper.toBidHistoryEntry(bid)),
      ordering: {
        primary: raw.ordering.primary,
        secondary: raw.ordering.secondary,
      },
    };
  }

  static toPlaceBidResult(raw: PlaceBidResultApi): PlaceBidResult {
    return {
      bidId: raw.bidId,
      auctionId: raw.auctionId,
      currentPrice: raw.currentPrice,
      bidCount: raw.bidCount,
      endsAt: raw.endsAt,
      extended: raw.extended,
      extensionCount: raw.extensionCount,
      minimumNextBid: raw.minimumNextBid,
      autoBidApplied: raw.autoBidApplied ?? false,
      effectiveWinnerId: raw.effectiveWinnerId ?? null,
    };
  }

  static toProxyBidStatus(raw: ProxyBidStatusApi): ProxyBidStatus {
    return {
      auctionId: raw.auctionId,
      bidderId: raw.bidderId,
      enabled: raw.enabled,
      maxAmount: raw.maxAmount,
      auctionStatus: raw.auctionStatus,
      currentPrice: raw.currentPrice,
      minimumProxyAmount: raw.minimumProxyAmount,
      currentlyLeading: raw.currentlyLeading,
      updatedAt: raw.updatedAt,
    };
  }

  static toDisableProxyBidResult(raw: DisableProxyBidApi): DisableProxyBidResult {
    return {
      auctionId: raw.auctionId,
      bidderId: raw.bidderId,
      disabled: raw.disabled,
    };
  }

  static toMyBidListItem(raw: MyBidListItemApi): MyBidListItem {
    return {
      auctionId: raw.auctionId,
      listingId: raw.listingId,
      sellerId: raw.sellerId,
      sellerName: raw.sellerName,
      title: raw.title,
      description: raw.description,
      imageUrl: raw.imageUrl,
      startPrice: raw.startPrice,
      currentPrice: raw.currentPrice,
      reservePrice: raw.reservePrice,
      bidIncrement: raw.bidIncrement,
      bidCount: raw.bidCount,
      auctionStatus: raw.auctionStatus,
      myBidStatus: raw.myBidStatus,
      winnerId: raw.winnerId,
      winnerName: raw.winnerName,
      startsAt: raw.startsAt,
      endsAt: raw.endsAt,
      originalEndsAt: raw.originalEndsAt,
      extensionCount: raw.extensionCount,
      highestBidderAlias: raw.highestBidderAlias ?? NO_LEADING_BIDDER_LABEL,
      myLatestBid: raw.myLatestBid,
      lastBidAt: raw.lastBidAt,
      isReserveMet: raw.isReserveMet,
    };
  }

  static toMyBidsOverview(raw: MyBidsOverviewApi): MyBidsOverview {
    return {
      user: { id: raw.user.id, name: raw.user.name },
      bids: raw.data.map((item) => BiddingApiMapper.toMyBidListItem(item)),
      summary: raw.summary,
    };
  }

  static toMyBidTimelineEntry(raw: MyBidTimelineEntryApi): MyBidTimelineEntry {
    return {
      at: raw.at,
      type: raw.type,
      amount: raw.amount,
      note: raw.note,
    };
  }

  static toMyBidDetail(raw: MyBidDetailApi): MyBidDetail {
    return {
      auction: BiddingApiMapper.toAuction(raw.auction),
      myLatestBid: raw.myLatestBid,
      myBidStatus: raw.myBidStatus,
      winningGap: raw.winningGap,
      isReserveMet: raw.isReserveMet,
      placedBidCount: raw.placedBidCount,
      timeline: raw.timeline.map((entry) => BiddingApiMapper.toMyBidTimelineEntry(entry)),
    };
  }
}
