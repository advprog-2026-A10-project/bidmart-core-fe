"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { getOrderUseCases } from "~/modules/order/infrastructure";
import { getOrderUiErrorMessage } from "~/modules/order/presentation/error-message";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

export default function SellerOrdersShippingPage() {
  const { orderId = "" } = useParams();
  const useCases = React.useMemo(() => getOrderUseCases(), []);
  const queryClient = useQueryClient();

  const [status, setStatus] = React.useState<(typeof shippingStatusOptions)[number]["value"]>("in_transit");
  const [tracking, setTracking] = React.useState("");

  const orderQuery = useQuery({
    queryKey: [QUERY_KEY_SELLER_ORDER_DETAIL, orderId],
    enabled: Boolean(orderId),
    queryFn: () => useCases.getOrder.execute({ orderId }),
  });

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
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = orderQuery.data;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Seller portal</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Update shipping status</h1>
        <p className="text-sm text-muted-foreground">
          Lot: {order.lot} - Order #{order.id}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping form</CardTitle>
          <CardDescription>Submit to `PATCH /seller/orders/:orderId/shipping`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shipping-status">Shipping status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as (typeof shippingStatusOptions)[number]["value"])}>
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
            />
          </div>

          {updateShippingMutation.isSuccess ? (
            <p className="rounded-md border border-emerald-400/40 bg-emerald-100/40 px-3 py-2 text-sm text-emerald-900">
              Shipping status updated successfully.
            </p>
          ) : null}

          {updateShippingMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {updateShippingErrorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={`/seller/orders/${order.id}`}>Back to detail</Link>
            </Button>
            <Button onClick={() => updateShippingMutation.mutate()} disabled={updateShippingMutation.isPending}>
              {updateShippingMutation.isPending ? "Updating..." : "Update shipping"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
