import { z } from "zod";

export const walletBalanceApiSchema = z.object({
  availableCents: z.number().int(),
  heldCents: z.number().int(),
  currency: z.string(),
});

export const walletTopupApiSchema = z.object({
  topupId: z.string().uuid(),
  status: z.string(),
  newAvailableCents: z.number().int(),
});

export const walletWithdrawApiSchema = z.object({
  withdrawId: z.string().uuid(),
  status: z.string(),
});

export const walletTransactionReferenceApiSchema = z.object({
  type: z.string(),
  id: z.string().uuid(),
});

export const walletTransactionApiSchema = z.object({
  txId: z.string().uuid(),
  type: z.string(),
  status: z.string().default("COMPLETED"),
  amountCents: z.number().int(),
  balanceAfterCents: z.number().int().default(0),
  createdAt: z.string().nullable().optional().default(null),
  refInfo: walletTransactionReferenceApiSchema.optional(),
  ref_info: walletTransactionReferenceApiSchema.optional(),
});

export const walletTransactionPageApiSchema = z.object({
  data: z.array(walletTransactionApiSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type WalletBalanceApi = z.infer<typeof walletBalanceApiSchema>;
export type WalletTopupApi = z.infer<typeof walletTopupApiSchema>;
export type WalletWithdrawApi = z.infer<typeof walletWithdrawApiSchema>;
export type WalletTransactionApi = z.infer<typeof walletTransactionApiSchema>;
export type WalletTransactionPageApi = z.infer<typeof walletTransactionPageApiSchema>;
