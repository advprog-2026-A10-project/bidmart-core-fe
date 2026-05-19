import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";
import type { WalletBalance } from "~/modules/wallet/domain/entities/wallet";

export class GetWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(): Promise<WalletBalance> {
    return this.walletRepository.getBalance();
  }
}
