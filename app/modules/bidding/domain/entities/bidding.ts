/**
 * Bidding — Domain Entity
 *
 * Pure TypeScript type with no framework or infrastructure dependencies (DIP, SRP).
 */
export type Bidding = {
  readonly id: BiddingId;
  // TODO: add domain fields here
};

/**
 * BiddingId — branded string type enforcing type safety at boundaries.
 */
export type BiddingId = string & { readonly __brand: "BiddingId" };

/**
 * Factory for creating a validated BiddingId value object.
 */
export function createBiddingId(value: string): BiddingId {
  if (!value || value.trim().length === 0) {
    throw new Error("BiddingId cannot be empty.");
  }
  return value as BiddingId;
}

/**
 * Factory for creating a Bidding entity with validation.
 */
export function createBidding(params: {
  id: string;
  // TODO: add entity params here
}): Bidding {
  if (!params.id || params.id.trim().length === 0) {
    throw new Error("Bidding id cannot be empty.");
  }
  return {
    id: createBiddingId(params.id),
    // TODO: map remaining fields
  };
}
