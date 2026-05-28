"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";

import { getOrderUseCases } from "~/modules/order/infrastructure";
import { getOrderUiErrorMessage } from "~/modules/order/presentation/error-message";
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
import { Label } from "~/shared/components/ui/label";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { Textarea } from "~/shared/components/ui/textarea";

const QUERY_KEY_ORDER_DETAIL = "order-detail";

const badgeVariantByStatus: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "ghost"
> = {
  "Awaiting Payment": "outline",
  "In Transit": "default",
  "Needs Confirmation": "secondary",
  Delivered: "ghost",
  "Dispute Closed": "ghost",
  "Dispute Alert": "destructive",
};

function canCreateDispute(status: string) {
  return status === "In Transit" || status === "Needs Confirmation" || status === "Dispute Alert";
}

export default function OrdersDisputePage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const useCases = React.useMemo(() => getOrderUseCases(), []);

  const [reason, setReason] = React.useState("Barang tidak sesuai");
  const [details, setDetails] = React.useState("");
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);

  const orderQuery = useQuery({
    queryKey: [QUERY_KEY_ORDER_DETAIL, orderId],
    enabled: Boolean(orderId),
    queryFn: () => useCases.getOrder.execute({ orderId }),
  });

  const disputeMutation = useMutation({
    mutationFn: () =>
      useCases.createDispute.execute({
        orderId,
        reason,
        details: details.trim() || undefined,
      }),
  });

  const orderLoadErrorMessage = getOrderUiErrorMessage(
    orderQuery.error,
    "We could not load this order for dispute submission.",
  );
  const disputeErrorMessage = getOrderUiErrorMessage(
    disputeMutation.error,
    "Failed to submit dispute. Please retry.",
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reason.trim()) {
      setValidationMessage("Reason is required.");
      return;
    }

    if (!reason.toLowerCase().includes("barang tidak sesuai")) {
      setValidationMessage("Reason must include: 'barang tidak sesuai'.");
      return;
    }

    setValidationMessage(null);
    disputeMutation.mutate();
  }

  if (orderQuery.isLoading) {
    return (
      <div className="container mx-auto space-y-4 px-4 py-8">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Order not found</CardTitle>
            <CardDescription>{orderLoadErrorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/orders">Back to orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = orderQuery.data;
  const eligible = canCreateDispute(order.status);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">Buyer action</p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Create order dispute</h1>
        <p className="text-muted-foreground text-sm">
          Submit issue to `POST /orders/:orderId/dispute/new`.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{order.lot}</CardTitle>
          <CardDescription>Order #{order.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Status</span>
            <Badge variant={badgeVariantByStatus[order.status] ?? "outline"}>{order.status}</Badge>
          </div>

          {!eligible ? (
            <p className="rounded-md border border-amber-400/40 bg-amber-100/40 px-3 py-2 text-sm text-amber-900">
              Dispute submission is not available for this order status.
            </p>
          ) : null}

          {disputeMutation.isSuccess ? (
            <div className="space-y-4">
              <p className="rounded-md border border-emerald-400/40 bg-emerald-100/40 px-3 py-2 text-sm text-emerald-900">
                Dispute submitted successfully.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/orders/${order.id}`}>Back to detail</Link>
                </Button>
                <Button variant="ghost" onClick={() => navigate("/orders")}>
                  Go to orders
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="dispute-reason">Reason (required)</Label>
                <Textarea
                  id="dispute-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  disabled={!eligible || disputeMutation.isPending}
                />
                <p className="text-muted-foreground text-xs">
                  As required by milestone scope, reason must contain &quot;barang tidak
                  sesuai&quot;.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dispute-details">Additional details (optional)</Label>
                <Textarea
                  id="dispute-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  rows={5}
                  placeholder="Tambah penjelasan kondisi barang, bukti, dan kronologi."
                  disabled={!eligible || disputeMutation.isPending}
                />
              </div>

              {validationMessage ? (
                <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                  {validationMessage}
                </p>
              ) : null}

              {disputeMutation.isError ? (
                <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                  {disputeErrorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/orders/${order.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={!eligible || disputeMutation.isPending}>
                  {disputeMutation.isPending ? "Submitting..." : "Submit dispute"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground text-xs">
          Validation requires phrase `barang tidak sesuai` sesuai spesifikasi WBS.
        </CardFooter>
      </Card>
    </div>
  );
}
