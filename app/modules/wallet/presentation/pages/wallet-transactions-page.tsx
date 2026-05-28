import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, BadgeCheck, Clock3, List } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { getWalletUseCases } from "~/modules/wallet/infrastructure/factories/wallet-repository.factory";
import { getWalletUiErrorMessage } from "~/modules/wallet/presentation/error-message";
import { WALLET_QUERY_KEYS } from "~/modules/wallet/presentation/query-keys";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusBadgeClassName(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
    case "PENDING":
      return "border-amber-300 bg-amber-100 text-amber-900";
    case "FAILED":
      return "border-red-300 bg-red-100 text-red-800";
    case "CANCELLED":
      return "border-slate-300 bg-slate-100 text-slate-800";
    default:
      return "border-zinc-300 bg-zinc-100 text-zinc-800";
  }
}

function getTypeBadgeClassName(type: string): string {
  if (type.includes("TOPUP") || type.includes("PAYMENT_RECEIVED")) {
    return "border-blue-300 bg-blue-100 text-blue-800";
  }
  if (type.includes("WITHDRAW") || type.includes("BID_HOLD")) {
    return "border-violet-300 bg-violet-100 text-violet-800";
  }
  if (type.includes("BID_RELEASE") || type.includes("REFUND")) {
    return "border-emerald-300 bg-emerald-100 text-emerald-800";
  }
  return "border-zinc-300 bg-zinc-100 text-zinc-800";
}

export default function WalletTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const useCases = getWalletUseCases();

  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const pageSize = parsePositiveInt(
    searchParams.get("pageSize") ?? searchParams.get("page_size"),
    DEFAULT_PAGE_SIZE,
  );

  const transactionsQuery = useQuery({
    queryKey: [WALLET_QUERY_KEYS.transactions, { page, pageSize }],
    queryFn: () =>
      useCases.listWalletTransactions.execute({
        page,
        pageSize,
      }),
  });

  const total = transactionsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const errorMessage = getWalletUiErrorMessage(
    transactionsQuery.error,
    "Failed to load wallet transactions.",
  );

  function updatePage(nextPage: number) {
    const normalized = Math.min(Math.max(1, nextPage), totalPages);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(normalized));
    next.set("pageSize", String(pageSize));
    setSearchParams(next);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Wallet Transactions</h1>
              <p className="text-muted-foreground text-sm">
                Track your wallet ledger for top up, withdraw, and auction-related balance movements.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/wallet">Back to Wallet</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border bg-white/70 p-3 backdrop-blur">
              <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <List className="size-3.5" />
                Total records
              </p>
              <p className="text-base font-semibold">{total}</p>
            </div>
            <div className="rounded-lg border bg-white/70 p-3 backdrop-blur">
              <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <Clock3 className="size-3.5" />
                Current page
              </p>
              <p className="text-base font-semibold">
                {page}/{totalPages}
              </p>
            </div>
            <div className="rounded-lg border bg-white/70 p-3 backdrop-blur">
              <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <ArrowDownUp className="size-3.5" />
                Page size
              </p>
              <p className="text-base font-semibold">{pageSize}</p>
            </div>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="space-y-2 px-6 py-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-2/3" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {transactionsQuery.isError ? (
                  <TableRow>
                    <TableCell className="text-destructive text-sm" colSpan={6}>
                      {errorMessage}
                    </TableCell>
                  </TableRow>
                ) : null}

                {!transactionsQuery.isLoading &&
                !transactionsQuery.isError &&
                transactionsQuery.data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground text-sm" colSpan={6}>
                      No transactions yet.
                    </TableCell>
                  </TableRow>
                ) : null}

                {transactionsQuery.data?.data.map((transaction) => (
                  <TableRow key={transaction.txId}>
                    <TableCell className="font-medium">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${getTypeBadgeClassName(transaction.type)}`}
                      >
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${getStatusBadgeClassName(transaction.status)}`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amountCents)}</TableCell>
                    <TableCell>{formatCurrency(transaction.balanceAfterCents)}</TableCell>
                    <TableCell className="text-xs">
                      {formatDateTime(transaction.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/wallet/transactions/${transaction.txId}`}>
                          <BadgeCheck className="size-4" />
                          Detail
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          <p className="text-muted-foreground text-sm">
            Page {page} of {totalPages} ({total} items)
          </p>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => updatePage(page - 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => updatePage(page + 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
