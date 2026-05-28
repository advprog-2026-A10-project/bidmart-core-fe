export type WalletBalance = {
  readonly availableCents: number;
  readonly heldCents: number;
  readonly currency: string;
};

export type WalletTransactionReference = {
  readonly type: string;
  readonly id: string;
};

export type WalletTransaction = {
  readonly txId: string;
  readonly type: string;
  readonly status: string;
  readonly amountCents: number;
  readonly balanceAfterCents: number;
  readonly createdAt: string | null;
  readonly refInfo?: WalletTransactionReference;
};

export type WalletTransactionPage = {
  readonly data: WalletTransaction[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
};

export type WalletTopupResult = {
  readonly topupId: string;
  readonly status: string;
  readonly newAvailableCents: number;
};

export type WalletWithdrawResult = {
  readonly withdrawId: string;
  readonly status: string;
};
