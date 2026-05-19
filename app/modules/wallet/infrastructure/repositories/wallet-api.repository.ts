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
} from "~/modules/wallet/domain/entities/wallet";
import type { IWalletRepository } from "~/modules/wallet/domain/repositories/wallet-repository.interface";
import { apiClient } from "~/shared/infrastructure/http/api-client";
import { WalletApiMapper } from "../api/wallet-api.mapper";
import {
  walletBalanceApiSchema,
  walletTopupApiSchema,
  walletTransactionApiSchema,
  walletTransactionPageApiSchema,
  walletWithdrawApiSchema,
} from "../api/schemas";

export class WalletApiRepository implements IWalletRepository {
  async getBalance(): Promise<WalletBalance> {
    const raw = await apiClient.get<unknown>("/wallet");
    const validated = walletBalanceApiSchema.parse(raw);
    return WalletApiMapper.toBalance(validated);
  }

  async topup(params: TopupWalletDTO): Promise<WalletTopupResult> {
    const raw = await apiClient.post<unknown>("/wallet/topup", {
      amountCents: params.amountCents,
      method: params.method,
    });
    const validated = walletTopupApiSchema.parse(raw);
    return WalletApiMapper.toTopupResult(validated);
  }

  async withdraw(params: WithdrawWalletDTO): Promise<WalletWithdrawResult> {
    const raw = await apiClient.post<unknown>("/wallet/withdraw", {
      amountCents: params.amountCents,
      bankAccount: {
        bank: params.bankAccount.bank,
        accountNo: params.bankAccount.accountNo,
        name: params.bankAccount.name,
      },
    });
    const validated = walletWithdrawApiSchema.parse(raw);
    return WalletApiMapper.toWithdrawResult(validated);
  }

  async listTransactions(params: ListWalletTransactionsDTO): Promise<WalletTransactionPage> {
    const raw = await apiClient.get<unknown>("/wallet/transactions", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
      },
    });
    const validated = walletTransactionPageApiSchema.parse(raw);
    return WalletApiMapper.toTransactionPage(validated);
  }

  async getTransactionById(params: GetWalletTransactionByIdDTO): Promise<WalletTransaction> {
    const raw = await apiClient.get<unknown>(`/wallet/transactions/${params.transactionId}`);
    const validated = walletTransactionApiSchema.parse(raw);
    return WalletApiMapper.toTransaction(validated);
  }
}
