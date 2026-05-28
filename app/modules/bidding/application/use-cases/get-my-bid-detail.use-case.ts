import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";
import type { MyBidDetail } from "~/modules/bidding/domain/entities/bidding";
import type { GetMyBidDetailDTO } from "../dtos/bidding.dto";

export class GetMyBidDetailUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  execute(dto: GetMyBidDetailDTO): Promise<MyBidDetail> {
    return this.biddingRepository.getMyBidDetail(dto);
  }
}
