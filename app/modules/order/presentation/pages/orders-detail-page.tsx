"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import type { Order } from "~/modules/order/domain/entities/order";
import { getOrderUseCases } from "~/modules/order/infrastructure";
import { Avatar, AvatarFallback } from "~/shared/components/ui/avatar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

const QUERY_KEY_ORDER_DETAIL = "order-detail";

const badgeVariantByStatus: Record<string, "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
  "Awaiting Payment": "outline",
  "In Transit": "default",
  "Needs Confirmation": "secondary",
  Delivered: "ghost",
  "Dispute Closed": "ghost",
  "Dispute Alert": "destructive",
};

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function LoadingState() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
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
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function Content({ order }: { order: Order }) {
  const financialRows = [
    { label: "Order total", value: order.total, notes: "Current order amount from API" },
    { label: "Currency", value: order.currency, notes: "Quoted transaction currency" },
    { label: "Created at", value: formatTimestamp(order.createdAt), notes: "Order record timestamp" },
    { label: "Updated at", value: formatTimestamp(order.updatedAt), notes: "Latest state update" },
  ];

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Order Detail</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{order.lot}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant={badgeVariantByStatus[order.status] ?? "outline"}>{order.status}</Badge>
            <span>Order #{order.id}</span>
            <span>Last activity: {order.lastActivity}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/orders">Back to orders</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/orders/${order.id}/confirm`}>Confirm receipt</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/orders/${order.id}/dispute/new`}>Create dispute</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total" value={order.total} helper="Order amount from backend" />
        <SummaryCard title="Stage" value={order.stage} helper="Lifecycle stage" />
        <SummaryCard title="Currency" value={order.currency} helper="Settlement currency" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Order snapshot</CardTitle>
            <CardDescription>Primary order fields from `/orders/:orderId`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Buyer</p>
                <p className="text-sm font-medium">{order.buyerId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Seller</p>
                <p className="text-sm font-medium">{order.sellerId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatTimestamp(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="text-sm font-medium">{formatTimestamp(order.updatedAt)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-2">
                {order.tags.length === 0 ? (
                  <Badge variant="ghost">No tags</Badge>
                ) : (
                  order.tags.map((tag) => (
                    <Badge key={tag} variant="ghost">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>Accounts tied to this order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{order.buyerId.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{order.buyerId}</p>
                  <p className="text-xs text-muted-foreground">Buyer</p>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{order.sellerId.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{order.sellerId}</p>
                  <p className="text-xs text-muted-foreground">Seller</p>
                </div>
              </div>
              <Badge variant="outline">Verified</Badge>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">Data source is API-driven.</CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial breakdown</CardTitle>
          <CardDescription>Simple detail table until payment endpoints are integrated.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line item</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="font-semibold">{row.value}</TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">{row.notes}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrdersDetailPage() {
  const { orderId = "" } = useParams();
  const useCases = React.useMemo(() => getOrderUseCases(), []);

  const orderQuery = useQuery({
    queryKey: [QUERY_KEY_ORDER_DETAIL, orderId],
    enabled: Boolean(orderId),
    queryFn: () =>
      useCases.getOrder.execute({
        orderId,
      }),
  });

  if (orderQuery.isLoading) {
    return <LoadingState />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Order detail not available</CardTitle>
            <CardDescription>
              We could not load this order from `/orders/:orderId`. Please verify the id or backend state.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/orders">Back to orders</Link>
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
