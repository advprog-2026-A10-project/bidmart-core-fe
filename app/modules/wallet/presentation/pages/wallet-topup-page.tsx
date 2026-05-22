import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";

import { getWalletUseCases } from "~/modules/wallet/infrastructure/factories/wallet-repository.factory";
import { getWalletUiErrorMessage } from "~/modules/wallet/presentation/error-message";
import { WALLET_QUERY_KEYS } from "~/modules/wallet/presentation/query-keys";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";

function toCents(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed);
}

export default function WalletTopupPage() {
  const useCases = getWalletUseCases();
  const queryClient = useQueryClient();
  const [lastTopupId, setLastTopupId] = useState<string | null>(null);

  const topupMutation = useMutation({
    mutationFn: (payload: { amountCents: number; method: string }) =>
      useCases.topupWallet.execute(payload),
    onSuccess: async (data) => {
      setLastTopupId(data.topupId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [WALLET_QUERY_KEYS.balance] }),
        queryClient.invalidateQueries({ queryKey: [WALLET_QUERY_KEYS.transactions] }),
      ]);
    },
  });

  const errorMessage = getWalletUiErrorMessage(topupMutation.error, "Top up failed.");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Top Up Wallet</h1>
          <p className="text-muted-foreground text-sm">
            Add funds to your wallet balance using one of the available payment methods.
          </p>
        </header>

        {topupMutation.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-4">
              <p className="text-destructive text-sm">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : null}

        {topupMutation.isSuccess && lastTopupId ? (
          <Card className="border-emerald-300/60">
            <CardContent className="py-4">
              <p className="text-sm font-medium text-emerald-700">
                Top up submitted successfully (ID: {lastTopupId}).
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Top Up Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const amountCents = toCents(String(formData.get("amountCents") ?? ""));
                const method = String(formData.get("method") ?? "").trim();

                if (!amountCents || method.length === 0) {
                  return;
                }

                topupMutation.mutate({
                  amountCents,
                  method,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="amountCents">Amount (IDR, cents)</Label>
                <Input
                  id="amountCents"
                  min={1}
                  name="amountCents"
                  placeholder="50000"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <Input id="method" name="method" placeholder="BANK_TRANSFER / EWALLET" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button disabled={topupMutation.isPending} type="submit">
                  {topupMutation.isPending ? "Submitting..." : "Submit Top Up"}
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link to="/wallet">Back to Wallet</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
