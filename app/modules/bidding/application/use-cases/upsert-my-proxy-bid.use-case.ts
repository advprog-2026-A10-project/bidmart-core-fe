import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { ProxyBidStatus } from "~/modules/bidding/domain/entities/bidding";
import type { UpsertProxyBidDTO } from "../dtos/bidding.dto";

export class UpsertMyProxyBidUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: UpsertProxyBidDTO): Promise<ProxyBidStatus> {
    return this.biddingRepository.upsertMyProxyBid(dto);
  }
}
