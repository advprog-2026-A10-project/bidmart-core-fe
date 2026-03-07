import { ArrowLeft, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";
import { WALLET_MOCK_PAYLOADS } from "./constant";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const transactions = WALLET_MOCK_PAYLOADS.mockTransactions;

  const getAmountColor = (type: string) => {
    if (["topup", "refund"].includes(type)) return "text-green-600 font-bold";
    return "text-red-600 font-bold";
  };

  const getAmountPrefix = (type: string) => {
    if (["topup", "refund"].includes(type)) return "+";
    return "-";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"; // Usually black/primary
      case "processing":
        return "secondary"; // Usually gray
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "topup":
        return "outline";
      case "withdraw":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredTransactions = (type: string) => {
    if (type === "all") return transactions;
    if (type === "payment")
      return transactions.filter((t) => !["topup", "withdraw"].includes(t.type));
    return transactions.filter((t) => t.type === type);
  };

  return (
    <div className="animate-in fade-in container max-w-5xl space-y-6 py-10 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/wallet">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">Monitor all your wallet activities</p>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <Filter className="text-muted-foreground h-4 w-4" />
          </div>
          <CardDescription>List of all your recent transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="topup">Top Up</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            {["all", "topup", "withdraw", "payment"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions(tab).length > 0 ? (
                        filteredTransactions(tab).map((txn) => (
                          <TableRow
                            key={txn.id}
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/wallet/transactions/${txn.id}`)}
                          >
                            <TableCell className="font-medium text-muted-foreground">
                              {new Intl.DateTimeFormat("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(txn.createdAt))}
                            </TableCell>
                            <TableCell>{txn.description}</TableCell>
                            <TableCell>
                              <Badge
                                variant={getTypeBadgeVariant(txn.type) as any}
                                className="text-[10px] uppercase"
                              >
                                {txn.type.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusBadgeVariant(txn.status) as any}
                                className="capitalize"
                              >
                                {txn.status}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right ${getAmountColor(txn.type)}`}>
                              {getAmountPrefix(txn.type)} {formatCurrency(txn.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
