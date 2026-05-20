import type { MyBidFilterValue } from "~/modules/bidding/domain/entities/bidding";

export type GetAuctionDTO = {
  auctionId: string;
};

export type GetAuctionHistoryDTO = {
  auctionId: string;
};

export type PlaceBidDTO = {
  auctionId: string;
  amount: number;
  maxAmount?: number;
};

export type ProxyBidActionDTO = {
  auctionId: string;
};

export type UpsertProxyBidDTO = {
  auctionId: string;
  maxAmount: number;
};

export type FinalizeAuctionDTO = {
  auctionId: string;
  force?: boolean;
};

export type ListMyBidsDTO = {
  status?: Exclude<MyBidFilterValue, "all">;
};

export type GetMyBidDetailDTO = {
  auctionId: string;
};
