// Inline DTO interfaces for wallet module mock payloads

interface GetWalletBalanceResponseDTO {
  balance: number;
  currency: string;
  pendingBalance: number;
}

interface TopUpRequestDTO {
  amount: number;
  paymentMethod: "bank_transfer" | "credit_card" | "ewallet";
}

interface TopUpResponseDTO {
  transactionId: string;
  status: "pending" | "completed" | "failed";
  amount: number;
}

interface WithdrawRequestDTO {
  amount: number;
  bankAccount: string;
  bankName: string;
}

interface WithdrawResponseDTO {
  transactionId: string;
  status: "processing" | "completed" | "failed";
  amount: number;
}

interface GetTransactionsRequestDTO {
  page?: number;
  type?: string;
}

interface TransactionDTO {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
}

interface GetTransactionsResponseDTO {
  transactions: TransactionDTO[];
  total: number;
}

interface GetTransactionDetailRequestDTO {
  transactionId: string;
}

interface GetTransactionDetailResponseDTO {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
  paymentMethod?: string;
  bankName?: string;
  bankAccount?: string;
}

interface MockTransactionDTO {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
}

export const WALLET_MOCK_PAYLOADS = {
  getWalletBalance: {
    response: {
      success: {
        balance: 2500000,
        currency: "IDR",
        pendingBalance: 150000,
      } satisfies GetWalletBalanceResponseDTO,
    },
  },
  topUp: {
    request: {
      amount: 500000,
      paymentMethod: "bank_transfer" as const,
    } satisfies TopUpRequestDTO,
    response: {
      success: {
        transactionId: "txn-1",
        status: "pending" as const,
        amount: 500000,
      } satisfies TopUpResponseDTO,
    },
  },
  withdraw: {
    request: {
      amount: 1000000,
      bankAccount: "1234567890",
      bankName: "Bank Central Asia",
    } satisfies WithdrawRequestDTO,
    response: {
      success: {
        transactionId: "txn-2",
        status: "processing" as const,
        amount: 1000000,
      } satisfies WithdrawResponseDTO,
    },
  },
  getTransactions: {
    request: {
      page: 1,
      type: "all",
    } satisfies GetTransactionsRequestDTO,
    response: {
      success: {
        transactions: [
          {
            id: "txn-1",
            type: "topup",
            amount: 500000,
            status: "completed",
            createdAt: "2026-03-05T10:00:00Z",
            description: "Top up via Bank Transfer",
          },
          {
            id: "txn-2",
            type: "withdraw",
            amount: 1000000,
            status: "processing",
            createdAt: "2026-03-06T14:30:00Z",
            description: "Withdrawal to Bank Central Asia",
          },
          {
            id: "txn-3",
            type: "bid_placed",
            amount: 250000,
            status: "completed",
            createdAt: "2026-03-04T09:15:00Z",
            description: "Bid placed on Vintage Watch",
          },
        ],
        total: 3,
      } satisfies GetTransactionsResponseDTO,
    },
  },
  getTransactionDetail: {
    request: {
      transactionId: "txn-1",
    } satisfies GetTransactionDetailRequestDTO,
    response: {
      success: {
        id: "txn-1",
        type: "topup",
        amount: 500000,
        status: "completed",
        createdAt: "2026-03-05T10:00:00Z",
        description: "Top up via Bank Transfer",
        paymentMethod: "bank_transfer",
        bankName: "Bank Central Asia",
        bankAccount: "1234567890",
      } satisfies GetTransactionDetailResponseDTO,
    },
  },
  mockTransactions: [
    {
      id: "txn-1",
      type: "topup",
      amount: 500000,
      status: "completed",
      createdAt: "2026-03-05T10:00:00Z",
      description: "Top up via Bank Transfer",
    },
    {
      id: "txn-2",
      type: "withdraw",
      amount: 1000000,
      status: "processing",
      createdAt: "2026-03-06T14:30:00Z",
      description: "Withdrawal to Bank Central Asia",
    },
    {
      id: "txn-3",
      type: "bid_placed",
      amount: 250000,
      status: "completed",
      createdAt: "2026-03-04T09:15:00Z",
      description: "Bid placed on Vintage Watch",
    },
    {
      id: "txn-4",
      type: "order_payment",
      amount: 750000,
      status: "completed",
      createdAt: "2026-03-03T11:45:00Z",
      description: "Payment for Digital Watch",
    },
    {
      id: "txn-5",
      type: "refund",
      amount: 50000,
      status: "completed",
      createdAt: "2026-03-02T16:20:00Z",
      description: "Refund for cancelled auction",
    },
  ] satisfies MockTransactionDTO[],
} as const;
