import type {
  Auction,
  AuctionHistory,
  DisableProxyBidResult,
  MyBidDetail,
  MyBidsOverview,
  PlaceBidResult,
  ProxyBidStatus,
} from "~/modules/bidding/domain/entities/bidding";
import type {
  FinalizeAuctionDTO,
  GetAuctionDTO,
  GetAuctionHistoryDTO,
  GetMyBidDetailDTO,
  ListMyBidsDTO,
  PlaceBidDTO,
  ProxyBidActionDTO,
  UpsertProxyBidDTO,
} from "~/modules/bidding/application/dtos/bidding.dto";

export interface IBiddingRepository {
  getAuction(params: GetAuctionDTO): Promise<Auction>;
  getAuctionHistory(params: GetAuctionHistoryDTO): Promise<AuctionHistory>;
  placeBid(params: PlaceBidDTO): Promise<PlaceBidResult>;

  getMyProxyBid(params: ProxyBidActionDTO): Promise<ProxyBidStatus>;
  upsertMyProxyBid(params: UpsertProxyBidDTO): Promise<ProxyBidStatus>;
  disableMyProxyBid(params: ProxyBidActionDTO): Promise<DisableProxyBidResult>;

  finalizeAuction(params: FinalizeAuctionDTO): Promise<Auction>;

  listMyBids(params: ListMyBidsDTO): Promise<MyBidsOverview>;
  getMyBidDetail(params: GetMyBidDetailDTO): Promise<MyBidDetail>;
}
