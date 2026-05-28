import type { ListWalletTransactionsDTO } from "~/modules/wallet/application/dtos/wallet.dto";
import type { WalletTransactionPage } from "~/modules/wallet/domain/entities/wallet";
import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";

export class ListWalletTransactionsUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(params: ListWalletTransactionsDTO): Promise<WalletTransactionPage> {
    return this.walletRepository.listTransactions(params);
  }
}
