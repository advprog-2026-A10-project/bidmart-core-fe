import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { Auction } from "~/modules/bidding/domain/entities/bidding";
import type { GetAuctionDTO } from "../dtos/bidding.dto";

export class GetAuctionUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: GetAuctionDTO): Promise<Auction> {
    return this.biddingRepository.getAuction(dto);
  }
}
