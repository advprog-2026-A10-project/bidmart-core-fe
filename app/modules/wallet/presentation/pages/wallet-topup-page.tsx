import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CircleOff, FlaskConical, Landmark, QrCode, Smartphone } from "lucide-react";
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

const DISABLED_PAYMENT_OPTIONS = [
  {
    id: "bank-transfer",
    title: "Bank Transfer Virtual Account",
    description: "Akan tersedia saat integrasi payment gateway selesai.",
    icon: Landmark,
  },
  {
    id: "ewallet",
    title: "E-Wallet",
    description: "Akan tersedia setelah provider e-wallet diaktifkan.",
    icon: Smartphone,
  },
  {
    id: "qris",
    title: "QRIS",
    description: "Akan tersedia saat endpoint callback payment siap.",
    icon: QrCode,
  },
] as const;

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
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Top Up Wallet</h1>
              <p className="text-muted-foreground text-sm">
                Development mode: payment channels are shown as preview, while manual top up is
                enabled for testing balance flow.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/wallet">Back to Wallet</Link>
            </Button>
          </div>
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
            <CardTitle>Top Up Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {DISABLED_PAYMENT_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <div
                    className="bg-muted/20 flex items-start justify-between gap-3 rounded-lg border p-3 opacity-70"
                    key={option.id}
                  >
                    <div className="space-y-1">
                      <p className="inline-flex items-center gap-2 text-sm font-medium">
                        <Icon className="size-4" />
                        {option.title}
                      </p>
                      <p className="text-muted-foreground text-xs">{option.description}</p>
                    </div>
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <CircleOff className="size-3.5" />
                      Disabled
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-emerald-300/50 bg-emerald-50/70 p-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800">
                <FlaskConical className="size-4" />
                Manual Balance Top Up (DEV)
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Mode development: nominal yang diinput akan langsung menambah saldo wallet.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const amountCents = toCents(String(formData.get("amountCents") ?? ""));

                if (!amountCents) {
                  return;
                }

                topupMutation.mutate({
                  amountCents,
                  method: "DEV_MANUAL_MOCK",
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="amountCents">Manual Amount (IDR)</Label>
                <Input
                  id="amountCents"
                  min={1}
                  name="amountCents"
                  placeholder="50000"
                  type="number"
                />
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
