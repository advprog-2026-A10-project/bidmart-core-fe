import { WalletApiRepository } from "../repositories/wallet-api.repository";
import { GetWalletUseCase } from "~/modules/wallet/application/use-cases/get-wallet.use-case";
import { GetWalletTransactionUseCase } from "~/modules/wallet/application/use-cases/get-wallet-transaction.use-case";
import { ListWalletTransactionsUseCase } from "~/modules/wallet/application/use-cases/list-wallet-transactions.use-case";
import { TopupWalletUseCase } from "~/modules/wallet/application/use-cases/topup-wallet.use-case";
import { WithdrawWalletUseCase } from "~/modules/wallet/application/use-cases/withdraw-wallet.use-case";

/**
 * WalletUseCaseFactory — wires up the dependency graph for the wallet module.
 *
 * Factory pattern: centralises construction so that swap-ins (e.g. mock repos in tests)
 * only require changing this one place. Use cases are unaware of which concrete
 * repository implementation they receive (DIP satisfied).
 */
export type WalletUseCases = {
  getWallet: GetWalletUseCase;
  topupWallet: TopupWalletUseCase;
  withdrawWallet: WithdrawWalletUseCase;
  listWalletTransactions: ListWalletTransactionsUseCase;
  getWalletTransaction: GetWalletTransactionUseCase;
};

export function createWalletUseCases(): WalletUseCases {
  const walletRepository = new WalletApiRepository();

  return {
    getWallet: new GetWalletUseCase(walletRepository),
    topupWallet: new TopupWalletUseCase(walletRepository),
    withdrawWallet: new WithdrawWalletUseCase(walletRepository),
    listWalletTransactions: new ListWalletTransactionsUseCase(walletRepository),
    getWalletTransaction: new GetWalletTransactionUseCase(walletRepository),
  };
}

// Singleton for client-side usage (avoids re-creating on every render)
let _walletUseCases: WalletUseCases | undefined;

export function getWalletUseCases(): WalletUseCases {
  if (!_walletUseCases) {
    _walletUseCases = createWalletUseCases();
  }
  return _walletUseCases;
}
