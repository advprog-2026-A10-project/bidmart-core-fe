import { createBidding } from "~/modules/bidding/domain/entities/bidding";
import type { Bidding } from "~/modules/bidding/domain/entities/bidding";
import type { BiddingApiResponse } from "./schemas";

/**
 * BiddingApiMapper — maps raw API response objects to domain entities.
 *
 * SRP: single responsibility — translation between API shape and domain shape.
 */
export class BiddingApiMapper {
  static toDomain(raw: BiddingApiResponse): Bidding {
    return createBidding({
      id: raw.id,
      // TODO: map remaining fields
    });
  }
}
