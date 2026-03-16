import type { Wallet } from "../entities/wallet";

/**
 * IWalletRepository — Repository Interface (Port)
 *
 * Defines the contract for wallet data access. Use cases depend on this
 * abstraction, not on any concrete implementation (DIP).
 */
export interface IWalletRepository {
  // TODO: add repository methods matching your use-cases
  // Example:
  // getById(params: { id: string }): Promise<Wallet>;
}
