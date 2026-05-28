"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "~/shared/components/ui/skeleton";

const QUERY_KEY_SELLER_ORDER_DETAIL = "seller-order-detail";

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

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function canUpdateShipping(order: Order) {
  return (
    order.status === "Awaiting Payment" ||
    order.status === "In Transit" ||
    order.status === "Needs Confirmation"
  );
}

function SummaryCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-muted-foreground text-xs">{helper}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

function Content({ order }: { order: Order }) {
  const shippingEnabled = canUpdateShipping(order);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
            Seller order detail
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">{order.lot}</h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={badgeVariantByStatus[order.status] ?? "outline"}>{order.status}</Badge>
            <span>Order #{order.id}</span>
            <span>Last activity: {order.lastActivity}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/seller/orders">Back</Link>
          </Button>
          <Button asChild size="sm" disabled={!shippingEnabled}>
            <Link to={`/seller/orders/${order.id}/shipping`}>Update shipping</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total" value={order.total} helper="Final order amount" />
        <SummaryCard title="Stage" value={order.stage} helper="Lifecycle stage from backend" />
        <SummaryCard
          title="Shipping action"
          value={shippingEnabled ? "Available" : "Locked"}
          helper={
            shippingEnabled
              ? "You can update fulfillment status."
              : "Status is final or under dispute."
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Order snapshot</CardTitle>
            <CardDescription>Data source: `GET /seller/orders/:orderId`.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">Buyer</p>
              <p className="text-sm font-medium break-all">{order.buyerId}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Seller</p>
              <p className="text-sm font-medium break-all">{order.sellerId}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Currency</p>
              <p className="text-sm font-medium">{order.currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Updated</p>
              <p className="text-sm font-medium">{formatTimestamp(order.updatedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Created</p>
              <p className="text-sm font-medium">{formatTimestamp(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Order ID</p>
              <p className="text-sm font-medium break-all">{order.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfillment tags</CardTitle>
            <CardDescription>Courier/tracking/dispute markers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.tags.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tags available for this order.</p>
            ) : (
              order.tags.map((tag) => (
                <div key={tag} className="border-border/70 bg-muted/40 rounded-xl border px-3 py-2">
                  <p className="text-sm font-medium">{tag}</p>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="text-muted-foreground text-xs">
            Shipping update endpoint: `PATCH /seller/orders/:orderId/shipping`.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SellerOrdersDetailPage() {
  const { orderId = "" } = useParams();
  const useCases = React.useMemo(() => getOrderUseCases(), []);

  const orderQuery = useQuery({
    queryKey: [QUERY_KEY_SELLER_ORDER_DETAIL, orderId],
    enabled: Boolean(orderId),
    queryFn: () => useCases.getOrder.execute({ orderId }),
  });

  const orderLoadErrorMessage = getOrderUiErrorMessage(
    orderQuery.error,
    "Unable to load this order right now.",
  );

  if (orderQuery.isLoading) {
    return <LoadingState />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Seller order detail not available</CardTitle>
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

  return <Content order={orderQuery.data} />;
}
