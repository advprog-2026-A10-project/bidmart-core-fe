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
import { createModuleLogger } from "~/shared/infrastructure/logger/module-logger";
import { WalletApiMapper } from "../api/wallet-api.mapper";
import {
  walletBalanceApiSchema,
  walletTopupApiSchema,
  walletTransactionApiSchema,
  walletTransactionPageApiSchema,
  walletWithdrawApiSchema,
} from "../api/schemas";

const logger = createModuleLogger("wallet");

export class WalletApiRepository implements IWalletRepository {
  async getBalance(): Promise<WalletBalance> {
    return logger.trace("getBalance", async ({ requestId }) => {
      const raw = await apiClient.get<unknown>("/wallet", {
        headers: { "X-Request-ID": requestId },
      });
      const validated = walletBalanceApiSchema.parse(raw);
      return WalletApiMapper.toBalance(validated);
    });
  }

  async topup(params: TopupWalletDTO): Promise<WalletTopupResult> {
    return logger.trace(
      "topup",
      async ({ requestId }) => {
        const raw = await apiClient.post<unknown>(
          "/wallet/topup",
          {
            amountCents: params.amountCents,
            method: params.method,
          },
          { headers: { "X-Request-ID": requestId } },
        );
        const validated = walletTopupApiSchema.parse(raw);
        return WalletApiMapper.toTopupResult(validated);
      },
      { amountCents: params.amountCents, method: params.method },
    );
  }

  async withdraw(params: WithdrawWalletDTO): Promise<WalletWithdrawResult> {
    return logger.trace(
      "withdraw",
      async ({ requestId }) => {
        const raw = await apiClient.post<unknown>(
          "/wallet/withdraw",
          {
            amountCents: params.amountCents,
            bankAccount: {
              bank: params.bankAccount.bank,
              accountNo: params.bankAccount.accountNo,
              name: params.bankAccount.name,
            },
          },
          { headers: { "X-Request-ID": requestId } },
        );
        const validated = walletWithdrawApiSchema.parse(raw);
        return WalletApiMapper.toWithdrawResult(validated);
      },
      { amountCents: params.amountCents, bank: params.bankAccount.bank },
    );
  }

  async listTransactions(params: ListWalletTransactionsDTO): Promise<WalletTransactionPage> {
    return logger.trace("listTransactions", async ({ requestId }) => {
      const raw = await apiClient.get<unknown>("/wallet/transactions", {
        params: { page: params.page, pageSize: params.pageSize },
        headers: { "X-Request-ID": requestId },
      });
      const validated = walletTransactionPageApiSchema.parse(raw);
      return WalletApiMapper.toTransactionPage(validated);
    });
  }

  async getTransactionById(params: GetWalletTransactionByIdDTO): Promise<WalletTransaction> {
    return logger.trace(
      "getTransactionById",
      async ({ requestId }) => {
        const raw = await apiClient.get<unknown>(`/wallet/transactions/${params.transactionId}`, {
          headers: { "X-Request-ID": requestId },
        });
        const validated = walletTransactionApiSchema.parse(raw);
        return WalletApiMapper.toTransaction(validated);
      },
      { transactionId: params.transactionId },
    );
  }
}
