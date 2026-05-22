import type { WithdrawWalletDTO } from "~/modules/wallet/application/dtos/wallet.dto";
import type { WalletWithdrawResult } from "~/modules/wallet/domain/entities/wallet";
import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";

export class WithdrawWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(params: WithdrawWalletDTO): Promise<WalletWithdrawResult> {
    return this.walletRepository.withdraw(params);
  }
}
