import type {
  GetWalletTransactionByIdDTO,
  ListWalletTransactionsDTO,
  TopupWalletDTO,
  WithdrawWalletDTO,
} from "~/modules/wallet/application/dtos/wallet.dto";
import type {
  WalletBalance,
  WalletTopupResult,
  WalletTransaction,
  WalletTransactionPage,
  WalletWithdrawResult,
} from "../entities/wallet";

export interface IWalletRepository {
  getBalance(): Promise<WalletBalance>;
  topup(params: TopupWalletDTO): Promise<WalletTopupResult>;
  withdraw(params: WithdrawWalletDTO): Promise<WalletWithdrawResult>;
  listTransactions(params: ListWalletTransactionsDTO): Promise<WalletTransactionPage>;
  getTransactionById(params: GetWalletTransactionByIdDTO): Promise<WalletTransaction>;
}
