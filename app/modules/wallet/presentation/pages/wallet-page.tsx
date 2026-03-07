import { Link } from "react-router";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";

import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { WALLET_MOCK_PAYLOADS } from "./constant";

export default function WalletPage() {
  const { balance, pendingBalance, currency } =
    WALLET_MOCK_PAYLOADS.getWalletBalance.response.success;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="animate-in fade-in container max-w-4xl space-y-8 py-10 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Dashboard</h1>
        <p className="text-muted-foreground">Manage your funds and view transaction history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="from-primary/90 to-primary text-primary-foreground overflow-hidden border-none bg-gradient-to-br shadow-xl md:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/80 font-medium">
              Total Balance
            </CardDescription>
            <CardTitle className="text-5xl font-bold tracking-tighter">
              {formatCurrency(balance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary-foreground/90 bg-primary-foreground/10 flex w-fit items-center space-x-2 rounded-full px-3 py-1 text-sm backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
              <span>Pending: {formatCurrency(pendingBalance)}</span>
            </div>
          </CardContent>
        </Card>

        <Link to="/wallet/topup" className="group block h-full">
          <Card className="flex h-full cursor-pointer flex-col justify-between transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="group-hover:text-primary flex items-center gap-2 transition-colors">
                <div className="rounded-full bg-green-100 p-2 text-green-600">
                  <ArrowDownToLine className="h-6 w-6" />
                </div>
                Top Up
              </CardTitle>
              <CardDescription>Add funds to your wallet</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="group-hover:bg-primary/90 w-full">Go to Top Up</Button>
            </CardFooter>
          </Card>
        </Link>

        <Link to="/wallet/withdraw" className="group block h-full">
          <Card className="flex h-full cursor-pointer flex-col justify-between transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="group-hover:text-destructive flex items-center gap-2 transition-colors">
                <div className="rounded-full bg-red-100 p-2 text-red-600">
                  <ArrowUpFromLine className="h-6 w-6" />
                </div>
                Withdraw
              </CardTitle>
              <CardDescription>Transfer funds to your bank</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant="outline"
                className="group-hover:border-destructive group-hover:text-destructive w-full"
              >
                Go to Withdraw
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="text-muted-foreground h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <p className="text-muted-foreground max-w-xs">
              View your complete transaction history including top-ups, withdrawals, and payments.
            </p>
            <Button variant="secondary" asChild>
              <Link to="/wallet/transactions">View All Transactions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
