"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";

import { getOrderUseCases } from "~/modules/order/infrastructure";
import { getOrderUiErrorMessage } from "~/modules/order/presentation/error-message";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Skeleton } from "~/shared/components/ui/skeleton";

const QUERY_KEY_ORDER_DETAIL = "order-detail";

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function OrdersConfirmPage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const useCases = React.useMemo(() => getOrderUseCases(), []);

  const orderQuery = useQuery({
    queryKey: [QUERY_KEY_ORDER_DETAIL, orderId],
    enabled: Boolean(orderId),
    queryFn: () => useCases.getOrder.execute({ orderId }),
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      useCases.confirmOrder.execute({
        orderId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDER_DETAIL, orderId] });
    },
  });

  const orderLoadErrorMessage = getOrderUiErrorMessage(
    orderQuery.error,
    "We could not load this order for confirmation.",
  );
  const confirmErrorMessage = getOrderUiErrorMessage(
    confirmMutation.error,
    "Failed to confirm this order. Please retry.",
  );

  if (orderQuery.isLoading) {
    return (
      <div className="container mx-auto space-y-4 px-4 py-8">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-48 w-full" />
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
  const confirmDisabled = confirmMutation.isPending || confirmMutation.isSuccess;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">Buyer action</p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Confirm order receipt</h1>
        <p className="text-muted-foreground text-sm">
          This action triggers `POST /orders/:orderId/confirm`.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{order.lot}</CardTitle>
          <CardDescription>Order #{order.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge variant="outline">{order.status}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total</p>
              <p className="text-sm font-medium">{order.total}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Seller</p>
              <p className="text-sm font-medium">{order.sellerId}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Updated at</p>
              <p className="text-sm font-medium">{formatTimestamp(order.updatedAt)}</p>
            </div>
          </div>

          {confirmMutation.isSuccess ? (
            <p className="rounded-md border border-emerald-400/40 bg-emerald-100/40 px-3 py-2 text-sm text-emerald-900">
              Order confirmation submitted successfully.
            </p>
          ) : null}

          {confirmMutation.isError ? (
            <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {confirmErrorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/orders/${order.id}`}>Back to detail</Link>
            </Button>
            <Button onClick={() => confirmMutation.mutate()} disabled={confirmDisabled}>
              {confirmMutation.isPending ? "Submitting..." : "Confirm received"}
            </Button>
            {confirmMutation.isSuccess ? (
              <Button variant="ghost" onClick={() => navigate(`/orders/${order.id}`)}>
                Return to detail
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
