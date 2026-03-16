import { createWallet } from "~/modules/wallet/domain/entities/wallet";
import type { Wallet } from "~/modules/wallet/domain/entities/wallet";
import type { WalletApiResponse } from "./schemas";

/**
 * WalletApiMapper — maps raw API response objects to domain entities.
 *
 * SRP: single responsibility — translation between API shape and domain shape.
 */
export class WalletApiMapper {
  static toDomain(raw: WalletApiResponse): Wallet {
    return createWallet({
      id: raw.id,
      // TODO: map remaining fields
    });
  }
}
