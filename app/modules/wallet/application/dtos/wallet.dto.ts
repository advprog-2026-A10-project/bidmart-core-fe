export type ListWalletTransactionsDTO = {
  page: number;
  pageSize: number;
};

export type GetWalletTransactionByIdDTO = {
  transactionId: string;
};

export type TopupWalletDTO = {
  amountCents: number;
  method: string;
};

export type WithdrawWalletDTO = {
  amountCents: number;
  bankAccount: {
    bank: string;
    accountNo: string;
    name: string;
  };
};
