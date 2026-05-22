import { AppError } from "~/shared/domain/errors/app-error";

/**
 * BiddingError — base domain error for all bidding errors.
 * SRP: all bidding domain errors extend this single base.
 */
export class BiddingError extends AppError {
  constructor(message: string, code: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "BiddingError";
  }
}

/**
 * BiddingNotFoundError — thrown when a bidding resource cannot be found by ID.
 */
export class BiddingNotFoundError extends BiddingError {
  constructor(id: string) {
    super(`Bidding "${id}" not found.`, "BIDDING_NOT_FOUND", 404);
    this.name = "BiddingNotFoundError";
  }
}
