import { ArrowLeft, Calendar, CheckCircle, Clock, CreditCard, XCircle } from "lucide-react";
import { Link, useParams } from "react-router";

import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Separator } from "~/shared/components/ui/separator";
import { WALLET_MOCK_PAYLOADS } from "./constant";

export default function TransactionDetailPage() {
  const { transactionId } = useParams();

  // In a real app, we would fetch by ID. Here we use the static mock response
  // but we can also try to find it in the list if we wanted dynamic data.
  // Requirement says: "Show full transaction detail from getTransactionDetail.response"
  const transaction = WALLET_MOCK_PAYLOADS.getTransactionDetail.response.success;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-10 w-10 text-green-500" />;
      case "processing":
        return <Clock className="h-10 w-10 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-10 w-10 text-red-500" />;
      default:
        return <Clock className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div className="animate-in zoom-in-95 container max-w-xl py-10 duration-500">
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-4">
          <Link to="/wallet/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Link>
        </Button>
      </div>

      <Card className="border-t-primary border-t-4 shadow-lg">
        <CardHeader className="pb-2 text-center">
          <div className="bg-muted/30 mx-auto mb-4 w-fit rounded-full p-3">
            {getStatusIcon(transaction.status)}
          </div>
          <CardTitle className="text-2xl font-bold">{formatCurrency(transaction.amount)}</CardTitle>
          <CardDescription className="text-foreground/80 text-base font-medium">
            {transaction.description}
          </CardDescription>
          <div className="mt-2">
            <Badge variant="outline" className="tracking-wider uppercase">
              {transaction.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono">{transactionId || transaction.id}</span>
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date
              </span>
              <span>{formatDate(transaction.createdAt)}</span>
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{transaction.type}</span>
            </div>
            <Separator />

            {transaction.paymentMethod && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Payment Method
                  </span>
                  <span className="capitalize">{transaction.paymentMethod.replace("_", " ")}</span>
                </div>
                <Separator />
              </>
            )}

            {transaction.bankName && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bank Name</span>
                  <span>{transaction.bankName}</span>
                </div>
                <Separator />
              </>
            )}

            {transaction.bankAccount && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bank Account</span>
                <span className="font-mono">{transaction.bankAccount}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 flex justify-center py-4">
          <p className="text-muted-foreground text-xs">
            If you have issues with this transaction, please contact support.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
