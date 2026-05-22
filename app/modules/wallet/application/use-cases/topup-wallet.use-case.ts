import type { TopupWalletDTO } from "~/modules/wallet/application/dtos/wallet.dto";
import type { WalletTopupResult } from "~/modules/wallet/domain/entities/wallet";
import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";

export class TopupWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(params: TopupWalletDTO): Promise<WalletTopupResult> {
    return this.walletRepository.topup(params);
  }
}
