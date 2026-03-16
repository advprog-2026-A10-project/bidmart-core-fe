import type { IBiddingRepository } from "~/modules/bidding/domain/repositories/bidding-repository.interface";

/**
 * GetBiddingUseCase — TODO: describe what this use-case does.
 */
export class GetBiddingUseCase {
  constructor(private readonly biddingRepository: IBiddingRepository) {}

  async execute(/* dto: TODO */): Promise<void> {
    // TODO: implement use-case logic using this.biddingRepository
  }
}
