import { BiddingApiRepository } from "../repositories/bidding-api.repository";
import { GetBiddingUseCase } from "~/modules/bidding/application/use-cases/get-bidding.use-case";

/**
 * BiddingUseCaseFactory — wires up the dependency graph for the bidding module.
 *
 * Factory pattern: centralises construction so that swap-ins (e.g. mock repos in tests)
 * only require changing this one place. Use cases are unaware of which concrete
 * repository implementation they receive (DIP satisfied).
 */
export type BiddingUseCases = {
  getBidding: GetBiddingUseCase;
};

export function createBiddingUseCases(): BiddingUseCases {
  const biddingRepository = new BiddingApiRepository();

  return {
    getBidding: new GetBiddingUseCase(biddingRepository),
  };
}

// Singleton for client-side usage (avoids re-creating on every render)
let _biddingUseCases: BiddingUseCases | undefined;

export function getBiddingUseCases(): BiddingUseCases {
  if (!_biddingUseCases) {
    _biddingUseCases = createBiddingUseCases();
  }
  return _biddingUseCases;
}
