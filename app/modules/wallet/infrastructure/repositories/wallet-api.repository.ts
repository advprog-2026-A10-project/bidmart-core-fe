import { apiClient } from "~/shared/infrastructure/http/api-client";
import type { Wallet } from "~/modules/wallet/domain/entities/wallet";
import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";
import { walletApiSchema } from "../api/schemas";
import { WalletApiMapper } from "../api/wallet-api.mapper";

/**
 * WalletApiRepository — concrete implementation of IWalletRepository.
 *
 * LSP: fully substitutable for IWalletRepository everywhere it is used.
 * OCP: new data sources extend IWalletRepository without modifying use-cases.
 *
 * All responses are validated against Zod schemas at this boundary (fail-fast).
 */
export class WalletApiRepository implements IWalletRepository {
  private readonly basePath = "/wallets"; // TODO: update base path

  // TODO: implement interface methods, e.g.:
  // async getById(params: { id: string }): Promise<Wallet> {
  //   const raw = await apiClient.get<unknown>(`${this.basePath}/${params.id}`);
  //   const validated = walletApiSchema.parse(raw);
  //   return WalletApiMapper.toDomain(validated);
  // }
}
