import { useQuery } from "@tanstack/react-query";
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
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Transaction Detail</h1>
            <p className="text-muted-foreground text-sm">
              Full metadata and ledger value for a selected wallet transaction.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/wallet/transactions">Back to Transactions</Link>
          </Button>
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
              <CardTitle>Transaction #{detailQuery.data.txId}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium">{detailQuery.data.type}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="font-medium">{detailQuery.data.status}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Amount</p>
                <p className="font-medium">{formatCurrency(detailQuery.data.amountCents)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Balance After</p>
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
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
