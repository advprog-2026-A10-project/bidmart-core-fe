import { apiClient } from "~/shared/infrastructure/http/api-client";
import { createModuleLogger } from "~/shared/infrastructure/logger/module-logger";
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

const logger = createModuleLogger("bidding");

export class BiddingApiRepository implements IBiddingRepository {
  async getAuction(params: GetAuctionDTO): Promise<Auction> {
    return logger.trace(
      "getAuction",
      async ({ requestId }) => {
        const raw = await apiClient.get<unknown>(`/auctions/${params.auctionId}`, {
          headers: { "X-Request-ID": requestId },
        });
        return BiddingApiMapper.toAuction(auctionApiSchema.parse(raw));
      },
      { auctionId: params.auctionId },
    );
  }

  async getAuctionHistory(params: GetAuctionHistoryDTO): Promise<AuctionHistory> {
    return logger.trace(
      "getAuctionHistory",
      async ({ requestId }) => {
        const raw = await apiClient.get<unknown>(`/auctions/${params.auctionId}/history`, {
          headers: { "X-Request-ID": requestId },
        });
        return BiddingApiMapper.toAuctionHistory(auctionHistoryApiSchema.parse(raw));
      },
      { auctionId: params.auctionId },
    );
  }

  async placeBid(params: PlaceBidDTO): Promise<PlaceBidResult> {
    return logger.trace(
      "placeBid",
      async ({ requestId }) => {
        const body: { amount: number; maxAmount?: number } = { amount: params.amount };
        if (params.maxAmount !== undefined) {
          body.maxAmount = params.maxAmount;
        }
        const raw = await apiClient.post<unknown>(`/auctions/${params.auctionId}/bids`, body, {
          headers: { "X-Request-ID": requestId },
        });
        return BiddingApiMapper.toPlaceBidResult(placeBidResultApiSchema.parse(raw));
      },
      { auctionId: params.auctionId, amount: params.amount },
    );
  }

  async getMyProxyBid(params: ProxyBidActionDTO): Promise<ProxyBidStatus> {
    return logger.trace(
      "getMyProxyBid",
      async ({ requestId }) => {
        const raw = await apiClient.get<unknown>(`/auctions/${params.auctionId}/proxy`, {
          headers: { "X-Request-ID": requestId },
        });
        return BiddingApiMapper.toProxyBidStatus(proxyBidStatusApiSchema.parse(raw));
      },
      { auctionId: params.auctionId },
    );
  }

  async upsertMyProxyBid(params: UpsertProxyBidDTO): Promise<ProxyBidStatus> {
    return logger.trace(
      "upsertMyProxyBid",
      async ({ requestId }) => {
        const raw = await apiClient.put<unknown>(
          `/auctions/${params.auctionId}/proxy`,
          { maxAmount: params.maxAmount },
          { headers: { "X-Request-ID": requestId } },
        );
        return BiddingApiMapper.toProxyBidStatus(proxyBidStatusApiSchema.parse(raw));
      },
      { auctionId: params.auctionId },
    );
  }

  async disableMyProxyBid(params: ProxyBidActionDTO): Promise<DisableProxyBidResult> {
    return logger.trace(
      "disableMyProxyBid",
      async ({ requestId }) => {
        const raw = await apiClient.delete<unknown>(`/auctions/${params.auctionId}/proxy`, {
          headers: { "X-Request-ID": requestId },
        });
        return BiddingApiMapper.toDisableProxyBidResult(disableProxyBidApiSchema.parse(raw));
      },
      { auctionId: params.auctionId },
    );
  }

  async finalizeAuction(params: FinalizeAuctionDTO): Promise<Auction> {
    return logger.trace(
      "finalizeAuction",
      async ({ requestId }) => {
        const query = params.force ? "?force=true" : "";
        const raw = await apiClient.post<unknown>(
          `/auctions/${params.auctionId}/finalize${query}`,
          undefined,
          { headers: { "X-Request-ID": requestId } },
        );
        return BiddingApiMapper.toAuction(auctionApiSchema.parse(raw));
      },
      { auctionId: params.auctionId, force: params.force ?? false },
    );
  }

  async listMyBids(params: ListMyBidsDTO): Promise<MyBidsOverview> {
    return logger.trace(
      "listMyBids",
      async ({ requestId }) => {
        const query = params.status ? `?status=${params.status}` : "";
        const raw = await apiClient.get<unknown>(`/me/bids${query}`, {
          headers: { "X-Request-ID": requestId },
        });
        return BiddingApiMapper.toMyBidsOverview(myBidsOverviewApiSchema.parse(raw));
      },
      { status: params.status ?? "all" },
    );
  }

  async getMyBidDetail(params: GetMyBidDetailDTO): Promise<MyBidDetail> {
    return logger.trace(
      "getMyBidDetail",
      async ({ requestId }) => {
        const raw = await apiClient.get<unknown>(`/me/bids/${params.auctionId}`, {
          headers: { "X-Request-ID": requestId },
        });
        return BiddingApiMapper.toMyBidDetail(myBidDetailApiSchema.parse(raw));
      },
      { auctionId: params.auctionId },
    );
  }
}
