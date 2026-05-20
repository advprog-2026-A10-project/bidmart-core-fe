import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { ProxyBidStatus } from "~/modules/bidding/domain/entities/bidding";
import type { ProxyBidActionDTO } from "../dtos/bidding.dto";

export class GetMyProxyBidUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: ProxyBidActionDTO): Promise<ProxyBidStatus> {
    return this.biddingRepository.getMyProxyBid(dto);
  }
}
