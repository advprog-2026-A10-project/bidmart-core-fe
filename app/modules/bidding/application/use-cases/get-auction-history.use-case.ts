import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { AuctionHistory } from "~/modules/bidding/domain/entities/bidding";
import type { GetAuctionHistoryDTO } from "../dtos/bidding.dto";

export class GetAuctionHistoryUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: GetAuctionHistoryDTO): Promise<AuctionHistory> {
    return this.biddingRepository.getAuctionHistory(dto);
  }
}
