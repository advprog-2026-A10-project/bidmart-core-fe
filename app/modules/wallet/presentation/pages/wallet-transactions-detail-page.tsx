import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ClipboardList, Landmark, Wallet } from "lucide-react";
import { Link, useParams } from "react-router";

import { getWalletUseCases } from "~/modules/wallet/infrastructure/factories/wallet-repository.factory";
import { getWalletUiErrorMessage } from "~/modules/wallet/presentation/error-message";
import { WALLET_QUERY_KEYS } from "~/modules/wallet/presentation/query-keys";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Skeleton } from "~/shared/components/ui/skeleton";

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

export default function WalletTransactionsDetailPage() {
  const { transactionId } = useParams();
  const useCases = getWalletUseCases();

  const detailQuery = useQuery({
    queryKey: [WALLET_QUERY_KEYS.transactionDetail, transactionId],
    queryFn: () => {
      if (!transactionId) {
        throw new Error("Missing transaction id");
      }
      return useCases.getWalletTransaction.execute({ transactionId });
    },
    enabled: Boolean(transactionId),
  });

  const errorMessage = getWalletUiErrorMessage(detailQuery.error, "Failed to load transaction.");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Transaction Detail</h1>
              <p className="text-muted-foreground text-sm">
                Review full metadata and ledger impact for a selected wallet transaction.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/wallet/transactions">Back to Transactions</Link>
            </Button>
          </div>
        </header>

        {detailQuery.isLoading ? (
          <Card>
            <CardContent className="space-y-3 py-6">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
            </CardContent>
          </Card>
        ) : null}

        {detailQuery.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-6">
              <p className="text-destructive text-sm">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : null}

        {!detailQuery.isLoading && !detailQuery.isError && detailQuery.data ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4" />
                Transaction #{detailQuery.data.txId}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium">{detailQuery.data.type}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Status</p>
                <p
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadgeClassName(detailQuery.data.status)}`}
                >
                  {detailQuery.data.status}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <Wallet className="size-3.5" />
                  Amount
                </p>
                <p className="font-medium">{formatCurrency(detailQuery.data.amountCents)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <Landmark className="size-3.5" />
                  Balance After
                </p>
                <p className="font-medium">{formatCurrency(detailQuery.data.balanceAfterCents)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Created At</p>
                <p className="font-medium">{formatDateTime(detailQuery.data.createdAt)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Reference</p>
                <p className="font-medium">
                  {detailQuery.data.refInfo
                    ? `${detailQuery.data.refInfo.type} • ${detailQuery.data.refInfo.id}`
                    : "-"}
                </p>
              </div>
              <div className="rounded-md border p-3 sm:col-span-2">
                <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <BadgeCheck className="size-3.5" />
                  Notes
                </p>
                <p className="text-muted-foreground text-sm">
                  This record reflects immutable wallet ledger history and is useful for balance
                  audit tracking.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
