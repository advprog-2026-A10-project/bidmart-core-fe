/**
 * Wallet — Domain Entity
 *
 * Pure TypeScript type with no framework or infrastructure dependencies (DIP, SRP).
 */
export type Wallet = {
  readonly id: WalletId;
  // TODO: add domain fields here
};

/**
 * WalletId — branded string type enforcing type safety at boundaries.
 */
export type WalletId = string & { readonly __brand: "WalletId" };

/**
 * Factory for creating a validated WalletId value object.
 */
export function createWalletId(value: string): WalletId {
  if (!value || value.trim().length === 0) {
    throw new Error("WalletId cannot be empty.");
  }
  return value as WalletId;
}

/**
 * Factory for creating a Wallet entity with validation.
 */
export function createWallet(params: {
  id: string;
  // TODO: add entity params here
}): Wallet {
  if (!params.id || params.id.trim().length === 0) {
    throw new Error("Wallet id cannot be empty.");
  }
  return {
    id: createWalletId(params.id),
    // TODO: map remaining fields
  };
}
