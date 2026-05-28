import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, Clock3, Coins, Landmark, Wallet } from "lucide-react";
import { Link } from "react-router";

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

export default function WalletPage() {
  const useCases = getWalletUseCases();
  const walletQuery = useQuery({
    queryKey: [WALLET_QUERY_KEYS.balance],
    queryFn: () => useCases.getWallet.execute(),
  });

  const loadErrorMessage = getWalletUiErrorMessage(
    walletQuery.error,
    "Failed to load wallet balance.",
  );

  const availableCents = walletQuery.data?.availableCents ?? 0;
  const heldCents = walletQuery.data?.heldCents ?? 0;
  const totalCents = availableCents + heldCents;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
              <p className="text-muted-foreground text-sm">
                Manage your available and held balance, then continue to top up, withdraw, and
                transaction tracking.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/wallet/transactions">
                <Clock3 className="size-4" />
                View transactions
              </Link>
            </Button>
          </div>
        </header>

        {walletQuery.isLoading ? (
          <Card>
            <CardContent className="space-y-3 py-6">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </CardContent>
          </Card>
        ) : null}

        {walletQuery.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-6">
              <p className="text-destructive text-sm">{loadErrorMessage}</p>
            </CardContent>
          </Card>
        ) : null}

        {!walletQuery.isLoading && !walletQuery.isError ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Balance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                  <Wallet className="size-4" />
                  Total wallet balance
                </p>
                <p className="text-3xl font-bold">{formatCurrency(totalCents)}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border p-4">
                    <p className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                      <Coins className="size-4" />
                      Available
                    </p>
                    <p className="text-xl font-semibold">{formatCurrency(availableCents)}</p>
                  </div>
                  <div className="rounded-md border p-4">
                    <p className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                      <Landmark className="size-4" />
                      Held
                    </p>
                    <p className="text-xl font-semibold">{formatCurrency(heldCents)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/wallet/topup">
                    <ArrowDownUp className="size-4" />
                    Top Up
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/wallet/withdraw">
                    <ArrowDownUp className="size-4 rotate-180" />
                    Withdraw
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/wallet/transactions">View Transactions</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </section>
  );
}
