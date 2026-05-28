import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { MyBidsOverview } from "~/modules/bidding/domain/entities/bidding";
import type { ListMyBidsDTO } from "../dtos/bidding.dto";

export class ListMyBidsUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: ListMyBidsDTO): Promise<MyBidsOverview> {
    return this.biddingRepository.listMyBids(dto);
  }
}
