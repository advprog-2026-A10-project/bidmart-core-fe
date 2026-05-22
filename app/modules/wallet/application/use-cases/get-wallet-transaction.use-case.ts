import type { GetWalletTransactionByIdDTO } from "~/modules/wallet/application/dtos/wallet.dto";
import type { WalletTransaction } from "~/modules/wallet/domain/entities/wallet";
import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";

export class GetWalletTransactionUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(params: GetWalletTransactionByIdDTO): Promise<WalletTransaction> {
    return this.walletRepository.getTransactionById(params);
  }
}
