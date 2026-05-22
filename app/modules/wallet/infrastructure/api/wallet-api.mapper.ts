import type {
  WalletBalance,
  WalletTopupResult,
  WalletTransaction,
  WalletTransactionPage,
  WalletWithdrawResult,
} from "~/modules/wallet/domain/entities/wallet";
import type {
  WalletBalanceApi,
  WalletTopupApi,
  WalletTransactionApi,
  WalletTransactionPageApi,
  WalletWithdrawApi,
} from "./schemas";

export class WalletApiMapper {
  static toBalance(raw: WalletBalanceApi): WalletBalance {
    return {
      availableCents: raw.availableCents,
      heldCents: raw.heldCents,
      currency: raw.currency,
    };
  }

  static toTopupResult(raw: WalletTopupApi): WalletTopupResult {
    return {
      topupId: raw.topupId,
      status: raw.status,
      newAvailableCents: raw.newAvailableCents,
    };
  }

  static toWithdrawResult(raw: WalletWithdrawApi): WalletWithdrawResult {
    return {
      withdrawId: raw.withdrawId,
      status: raw.status,
    };
  }

  static toTransaction(raw: WalletTransactionApi): WalletTransaction {
    return {
      txId: raw.txId,
      type: raw.type,
      status: raw.status,
      amountCents: raw.amountCents,
      balanceAfterCents: raw.balanceAfterCents,
      createdAt: raw.createdAt ?? null,
      refInfo: raw.refInfo ?? raw.ref_info,
    };
  }

  static toTransactionPage(raw: WalletTransactionPageApi): WalletTransactionPage {
    return {
      data: raw.data.map((transaction) => WalletApiMapper.toTransaction(transaction)),
      page: raw.page,
      pageSize: raw.pageSize,
      total: raw.total,
    };
  }
}
