import { AppError } from "~/shared/domain/errors/app-error";

/**
 * WalletError — base domain error for all wallet errors.
 * SRP: all wallet domain errors extend this single base.
 */
export class WalletError extends AppError {
  constructor(message: string, code: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "WalletError";
  }
}

/**
 * WalletNotFoundError — thrown when a wallet resource cannot be found by ID.
 */
export class WalletNotFoundError extends WalletError {
  constructor(id: string) {
    super(`Wallet "${id}" not found.`, "WALLET_NOT_FOUND", 404);
    this.name = "WalletNotFoundError";
  }
}
