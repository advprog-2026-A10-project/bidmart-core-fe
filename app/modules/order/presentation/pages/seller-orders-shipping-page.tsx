"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import type { Order } from "~/modules/order/domain/entities/order";
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
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components/ui/select";
import { Skeleton } from "~/shared/components/ui/skeleton";

const QUERY_KEY_SELLER_ORDER_DETAIL = "seller-order-detail";
const SELLER_ORDERS_QUERY_PREFIX = "seller-orders-page-orders";

const shippingStatusOptions = [
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered (Waiting confirmation)" },
] as const;

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

function canUpdateShipping(order: Order) {
  return (
    order.status === "Awaiting Payment" ||
    order.status === "In Transit" ||
    order.status === "Needs Confirmation"
  );
}

function suggestStatusFromOrder(order: Order): (typeof shippingStatusOptions)[number]["value"] {
  if (order.status === "In Transit") {
    return "in_transit";
  }

  if (order.status === "Needs Confirmation" || order.status === "Delivered") {
    return "delivered";
  }

  return "packed";
}

export default function SellerOrdersShippingPage() {
  const { orderId = "" } = useParams();
  const useCases = React.useMemo(() => getOrderUseCases(), []);
  const queryClient = useQueryClient();

  const [status, setStatus] =
    React.useState<(typeof shippingStatusOptions)[number]["value"]>("in_transit");
  const [tracking, setTracking] = React.useState("");

  const orderQuery = useQuery({
    queryKey: [QUERY_KEY_SELLER_ORDER_DETAIL, orderId],
    enabled: Boolean(orderId),
    queryFn: () => useCases.getOrder.execute({ orderId }),
  });

  React.useEffect(() => {
    if (!orderQuery.data) {
      return;
    }

    setStatus(suggestStatusFromOrder(orderQuery.data));
  }, [orderQuery.data]);

  const updateShippingMutation = useMutation({
    mutationFn: () =>
      useCases.updateShippingStatus.execute({
        orderId,
        status,
        tracking: tracking.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SELLER_ORDER_DETAIL, orderId] }),
        queryClient.invalidateQueries({ queryKey: [SELLER_ORDERS_QUERY_PREFIX] }),
      ]);
    },
  });

  const orderLoadErrorMessage = getOrderUiErrorMessage(
    orderQuery.error,
    "Unable to load this order for shipping update.",
  );
  const updateShippingErrorMessage = getOrderUiErrorMessage(
    updateShippingMutation.error,
    "Failed to update shipping status. Please retry.",
  );

  if (orderQuery.isLoading) {
    return (
      <div className="container mx-auto space-y-4 px-4 py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Shipping update not available</CardTitle>
            <CardDescription>{orderLoadErrorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/seller/orders">Back to seller orders</Link>
            </Button>
            <Button variant="outline" onClick={() => void orderQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = orderQuery.data;
  const shippingEnabled = canUpdateShipping(order);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
            Seller fulfillment
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Update shipping</h1>
          <p className="text-muted-foreground text-sm">
            Set latest fulfillment status for this order lifecycle.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/seller/orders/${order.id}`}>Back to detail</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/seller/orders">Back to list</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={badgeVariantByStatus[order.status] ?? "outline"}>{order.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current stage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{order.stage}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{shippingEnabled ? "Editable" : "Locked"}</p>
            <p className="text-muted-foreground text-xs">
              {shippingEnabled
                ? "You can submit shipping progression."
                : "Order is already final or disputed."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping form</CardTitle>
          <CardDescription>Endpoint: `PATCH /seller/orders/:orderId/shipping`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-border/70 bg-muted/30 rounded-2xl border p-4">
            <p className="text-sm font-medium">{order.lot}</p>
            <p className="text-muted-foreground text-xs">Order #{order.id}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping-status">Shipping status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as (typeof shippingStatusOptions)[number]["value"])
              }
              disabled={!shippingEnabled || updateShippingMutation.isPending}
            >
              <SelectTrigger id="shipping-status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {shippingStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking-code">Tracking code (optional)</Label>
            <Input
              id="tracking-code"
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
              placeholder="TRK-XXXX"
              disabled={!shippingEnabled || updateShippingMutation.isPending}
            />
          </div>

          {!shippingEnabled ? (
            <p className="rounded-md border border-amber-400/40 bg-amber-100/40 px-3 py-2 text-sm text-amber-900">
              Shipping update is locked for this status. Review order detail for dispute/final
              state.
            </p>
          ) : null}

          {updateShippingMutation.isSuccess ? (
            <p className="rounded-md border border-emerald-400/40 bg-emerald-100/40 px-3 py-2 text-sm text-emerald-900">
              Shipping status updated successfully.
            </p>
          ) : null}

          {updateShippingMutation.isError ? (
            <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {updateShippingErrorMessage}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/seller/orders/${order.id}`}>Back to detail</Link>
          </Button>
          <Button
            onClick={() => updateShippingMutation.mutate()}
            disabled={!shippingEnabled || updateShippingMutation.isPending}
          >
            {updateShippingMutation.isPending ? "Updating..." : "Update shipping"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
