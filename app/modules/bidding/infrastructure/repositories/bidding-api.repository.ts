import { apiClient } from "~/shared/infrastructure/http/api-client";
import type {
  Auction,
  AuctionHistory,
  DisableProxyBidResult,
  MyBidDetail,
  MyBidsOverview,
  PlaceBidResult,
  ProxyBidStatus,
} from "~/modules/bidding/domain/entities/bidding";
import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
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
import {
  auctionApiSchema,
  auctionHistoryApiSchema,
  disableProxyBidApiSchema,
  myBidDetailApiSchema,
  myBidsOverviewApiSchema,
  placeBidResultApiSchema,
  proxyBidStatusApiSchema,
} from "../api/schemas";
import { BiddingApiMapper } from "../api/bidding-api.mapper";

export class BiddingApiRepository implements IBiddingRepository {
  async getAuction(params: GetAuctionDTO): Promise<Auction> {
    const raw = await apiClient.get<unknown>(`/auctions/${params.auctionId}`);
    return BiddingApiMapper.toAuction(auctionApiSchema.parse(raw));
  }

  async getAuctionHistory(params: GetAuctionHistoryDTO): Promise<AuctionHistory> {
    const raw = await apiClient.get<unknown>(`/auctions/${params.auctionId}/history`);
    return BiddingApiMapper.toAuctionHistory(auctionHistoryApiSchema.parse(raw));
  }

  async placeBid(params: PlaceBidDTO): Promise<PlaceBidResult> {
    const body: { amount: number; maxAmount?: number } = { amount: params.amount };
    if (params.maxAmount !== undefined) {
      body.maxAmount = params.maxAmount;
    }
    const raw = await apiClient.post<unknown>(`/auctions/${params.auctionId}/bids`, body);
    return BiddingApiMapper.toPlaceBidResult(placeBidResultApiSchema.parse(raw));
  }

  async getMyProxyBid(params: ProxyBidActionDTO): Promise<ProxyBidStatus> {
    const raw = await apiClient.get<unknown>(`/auctions/${params.auctionId}/proxy`);
    return BiddingApiMapper.toProxyBidStatus(proxyBidStatusApiSchema.parse(raw));
  }

  async upsertMyProxyBid(params: UpsertProxyBidDTO): Promise<ProxyBidStatus> {
    const raw = await apiClient.put<unknown>(`/auctions/${params.auctionId}/proxy`, {
      maxAmount: params.maxAmount,
    });
    return BiddingApiMapper.toProxyBidStatus(proxyBidStatusApiSchema.parse(raw));
  }

  async disableMyProxyBid(params: ProxyBidActionDTO): Promise<DisableProxyBidResult> {
    const raw = await apiClient.delete<unknown>(`/auctions/${params.auctionId}/proxy`);
    return BiddingApiMapper.toDisableProxyBidResult(disableProxyBidApiSchema.parse(raw));
  }

  async finalizeAuction(params: FinalizeAuctionDTO): Promise<Auction> {
    const query = params.force ? "?force=true" : "";
    const raw = await apiClient.post<unknown>(
      `/auctions/${params.auctionId}/finalize${query}`,
    );
    return BiddingApiMapper.toAuction(auctionApiSchema.parse(raw));
  }

  async listMyBids(params: ListMyBidsDTO): Promise<MyBidsOverview> {
    const query = params.status ? `?status=${params.status}` : "";
    const raw = await apiClient.get<unknown>(`/me/bids${query}`);
    return BiddingApiMapper.toMyBidsOverview(myBidsOverviewApiSchema.parse(raw));
  }

  async getMyBidDetail(params: GetMyBidDetailDTO): Promise<MyBidDetail> {
    const raw = await apiClient.get<unknown>(`/me/bids/${params.auctionId}`);
    return BiddingApiMapper.toMyBidDetail(myBidDetailApiSchema.parse(raw));
  }
}
