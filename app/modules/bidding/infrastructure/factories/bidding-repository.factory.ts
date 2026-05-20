import { BiddingApiRepository } from "../repositories/bidding-api.repository";
import {
  DisableMyProxyBidUseCase,
  GetAuctionHistoryUseCase,
  GetAuctionUseCase,
  GetMyBidDetailUseCase,
  GetMyProxyBidUseCase,
  ListMyBidsUseCase,
  PlaceBidUseCase,
  UpsertMyProxyBidUseCase,
} from "~/modules/bidding/application/use-cases";

export type BiddingUseCases = {
  getAuction: GetAuctionUseCase;
  getAuctionHistory: GetAuctionHistoryUseCase;
  placeBid: PlaceBidUseCase;
  getMyProxyBid: GetMyProxyBidUseCase;
  upsertMyProxyBid: UpsertMyProxyBidUseCase;
  disableMyProxyBid: DisableMyProxyBidUseCase;
  listMyBids: ListMyBidsUseCase;
  getMyBidDetail: GetMyBidDetailUseCase;
};

export function createBiddingUseCases(): BiddingUseCases {
  const repository = new BiddingApiRepository();
  return {
    getAuction: new GetAuctionUseCase(repository),
    getAuctionHistory: new GetAuctionHistoryUseCase(repository),
    placeBid: new PlaceBidUseCase(repository),
    getMyProxyBid: new GetMyProxyBidUseCase(repository),
    upsertMyProxyBid: new UpsertMyProxyBidUseCase(repository),
    disableMyProxyBid: new DisableMyProxyBidUseCase(repository),
    listMyBids: new ListMyBidsUseCase(repository),
    getMyBidDetail: new GetMyBidDetailUseCase(repository),
  };
}

let _biddingUseCases: BiddingUseCases | undefined;

export function getBiddingUseCases(): BiddingUseCases {
  if (!_biddingUseCases) {
    _biddingUseCases = createBiddingUseCases();
  }
  return _biddingUseCases;
}
