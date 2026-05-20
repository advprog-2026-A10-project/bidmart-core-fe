import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { PlaceBidResult } from "~/modules/bidding/domain/entities/bidding";
import type { PlaceBidDTO } from "../dtos/bidding.dto";

export class PlaceBidUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: PlaceBidDTO): Promise<PlaceBidResult> {
    return this.biddingRepository.placeBid(dto);
  }
}
