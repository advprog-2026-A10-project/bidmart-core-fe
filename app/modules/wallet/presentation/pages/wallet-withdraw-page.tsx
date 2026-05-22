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

export default function WalletWithdrawPage() {
  const useCases = getWalletUseCases();
  const queryClient = useQueryClient();
  const [lastWithdrawId, setLastWithdrawId] = useState<string | null>(null);

  const withdrawMutation = useMutation({
    mutationFn: (payload: {
      amountCents: number;
      bankAccount: { bank: string; accountNo: string; name: string };
    }) => useCases.withdrawWallet.execute(payload),
    onSuccess: async (data) => {
      setLastWithdrawId(data.withdrawId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [WALLET_QUERY_KEYS.balance] }),
        queryClient.invalidateQueries({ queryKey: [WALLET_QUERY_KEYS.transactions] }),
      ]);
    },
  });

  const errorMessage = getWalletUiErrorMessage(withdrawMutation.error, "Withdraw failed.");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Withdraw Balance</h1>
          <p className="text-muted-foreground text-sm">
            Withdraw your available balance to a verified destination bank account.
          </p>
        </header>

        {withdrawMutation.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-4">
              <p className="text-destructive text-sm">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : null}

        {withdrawMutation.isSuccess && lastWithdrawId ? (
          <Card className="border-emerald-300/60">
            <CardContent className="py-4">
              <p className="text-sm font-medium text-emerald-700">
                Withdraw request submitted (ID: {lastWithdrawId}).
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Withdraw Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const amountCents = toCents(String(formData.get("amountCents") ?? ""));
                const bank = String(formData.get("bank") ?? "").trim();
                const accountNo = String(formData.get("accountNo") ?? "").trim();
                const name = String(formData.get("name") ?? "").trim();

                if (
                  !amountCents ||
                  bank.length === 0 ||
                  accountNo.length === 0 ||
                  name.length === 0
                ) {
                  return;
                }

                withdrawMutation.mutate({
                  amountCents,
                  bankAccount: {
                    bank,
                    accountNo,
                    name,
                  },
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
                <Label htmlFor="bank">Bank</Label>
                <Input id="bank" name="bank" placeholder="BCA" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNo">Account Number</Label>
                <Input id="accountNo" name="accountNo" placeholder="1234567890" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Account Holder</Label>
                <Input id="name" name="name" placeholder="Nama Pemilik Rekening" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button disabled={withdrawMutation.isPending} type="submit">
                  {withdrawMutation.isPending ? "Submitting..." : "Submit Withdraw"}
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
