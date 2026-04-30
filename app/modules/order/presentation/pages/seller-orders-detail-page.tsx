"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { getOrderUseCases } from "~/modules/order/infrastructure";
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

const QUERY_KEY_SELLER_ORDER_DETAIL = "seller-order-detail";

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function SellerOrdersDetailPage() {
  const { orderId = "" } = useParams();
  const useCases = React.useMemo(() => getOrderUseCases(), []);

  const orderQuery = useQuery({
    queryKey: [QUERY_KEY_SELLER_ORDER_DETAIL, orderId],
    enabled: Boolean(orderId),
    queryFn: () => useCases.getOrder.execute({ orderId }),
  });

  if (orderQuery.isLoading) {
    return (
      <div className="container mx-auto space-y-4 px-4 py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Seller order detail not available</CardTitle>
            <CardDescription>Unable to load this order right now.</CardDescription>
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{order.lot}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{order.status}</Badge>
          <span className="text-sm text-muted-foreground">Order #{order.id}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order snapshot</CardTitle>
          <CardDescription>Data from `/seller/orders/:orderId`.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Buyer</p>
            <p className="text-sm font-medium">{order.buyerId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seller</p>
            <p className="text-sm font-medium">{order.sellerId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stage</p>
            <p className="text-sm font-medium">{order.stage}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-medium">
              {order.total} {order.currency}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created at</p>
            <p className="text-sm font-medium">{formatTimestamp(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated at</p>
            <p className="text-sm font-medium">{formatTimestamp(order.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Shipping and fulfillment metadata.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {order.tags.length === 0 ? (
            <Badge variant="ghost">No tags</Badge>
          ) : (
            order.tags.map((tag) => (
              <Badge key={tag} variant="ghost">
                {tag}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/seller/orders">Back to seller orders</Link>
        </Button>
        <Button asChild>
          <Link to={`/seller/orders/${order.id}/shipping`}>Update shipping</Link>
        </Button>
      </div>
    </div>
  );
}
