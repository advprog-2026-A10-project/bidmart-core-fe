import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { DisableProxyBidResult } from "~/modules/bidding/domain/entities/bidding";
import type { ProxyBidActionDTO } from "../dtos/bidding.dto";

export class DisableMyProxyBidUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: ProxyBidActionDTO): Promise<DisableProxyBidResult> {
    return this.biddingRepository.disableMyProxyBid(dto);
  }
}
