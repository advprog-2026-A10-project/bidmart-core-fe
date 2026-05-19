"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import type { Notification } from "~/modules/order/domain/entities/notification";
import type { Order } from "~/modules/order/domain/entities/order";
import { getOrderUseCases } from "~/modules/order/infrastructure";
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
import { ScrollArea } from "~/shared/components/ui/scroll-area";
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";

const stageFilters = [
  {
    value: "active",
    label: "Active",
    description: "Live auctions, payment holds, and anti-sniping extensions.",
  },
  {
    value: "processing",
    label: "Processing",
    description: "Fulfillment, in-transit updates, and confirmation workflows.",
  },
  {
    value: "completed",
    label: "Completed",
    description: "Settled orders with receipts and archived disputes.",
  },
] as const;

type OrderStage = (typeof stageFilters)[number]["value"];

const QUERY_KEY_ORDERS = "orders-page-orders";
const QUERY_KEY_NOTIFICATIONS = "orders-page-notifications";

const badgeVariantByStatus: Record<string, "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
  "Awaiting Payment": "outline",
  "In Transit": "default",
  "Needs Confirmation": "secondary",
  Delivered: "ghost",
  "Dispute Closed": "ghost",
  "Dispute Alert": "destructive",
};

const notificationToneVariant: Record<Notification["type"], "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
  BID_OUTBID: "secondary",
  AUCTION_WON: "default",
  AUCTION_LOST: "outline",
  ORDER_SHIPPED: "outline",
  ORDER_DELIVERED: "ghost",
  PAYMENT_RECEIVED: "default",
  DISPUTE_OPENED: "destructive",
  DISPUTE_RESOLVED: "ghost",
  AUCTION_EXTENDED: "secondary",
  BidPlaced: "secondary",
  WinnerDetermined: "default",
  OrderUpdate: "outline",
  System: "ghost",
};

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function OrdersPage() {
  const [selectedStage, setSelectedStage] = React.useState<OrderStage>(stageFilters[0].value);
  const useCases = React.useMemo(() => getOrderUseCases(), []);

  const ordersQuery = useQuery({
    queryKey: [QUERY_KEY_ORDERS, selectedStage],
    queryFn: () =>
      useCases.listOrders.execute({
        role: "buyer",
        stage: selectedStage,
      }),
  });

  const notificationsQuery = useQuery({
    queryKey: [QUERY_KEY_NOTIFICATIONS],
    queryFn: () =>
      useCases.listNotifications.execute({
        limit: 10,
      }),
  });

  const orders = ordersQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];
  const stageDescription = stageFilters.find((stage) => stage.value === selectedStage)?.description;

  const summaryStats = [
    {
      title: "Live orders",
      value: `${orders.filter((order) => order.stage === "active").length}`,
      trend: "Buy-side",
      description: "Winning bids waiting for payment or escrow capture.",
    },
    {
      title: "In flight",
      value: `${orders.filter((order) => order.stage === "processing").length}`,
      trend: "Fulfillment",
      description: "Courier handoffs and confirmations in progress.",
    },
    {
      title: "Settled",
      value: `${orders.filter((order) => order.stage === "completed").length}`,
      trend: "Archive",
      description: "Delivered or closed orders already reconciled.",
    },
  ];

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Order center</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders and notifications</h1>
          <p className="text-sm text-muted-foreground">
            Track order lifecycle and recent notification events from the live API contract.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void ordersQuery.refetch()}>
            Refresh orders
          </Button>
          <Button variant="outline" size="sm" onClick={() => void notificationsQuery.refetch()}>
            Refresh notifications
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg">{stat.title}</CardTitle>
              <CardDescription>{stat.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 px-6 pb-6">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <Badge variant="ghost">{stat.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="flex flex-col">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <CardTitle>Order board</CardTitle>
              <Badge variant="outline">{selectedStage.toUpperCase()}</Badge>
            </div>
            <CardDescription>{stageDescription}</CardDescription>
            <Tabs value={selectedStage} onValueChange={(value) => setSelectedStage(value as OrderStage)}>
              <TabsList>
                {stageFilters.map((filter) => (
                  <TabsTrigger key={filter.value} value={filter.value}>
                    {filter.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {ordersQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-destructive">
                      Unable to load orders for this stage right now.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground">
                      No orders available for the selected stage.
                    </TableCell>
                  </TableRow>
                ) : null}

                {orders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{order.lot}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{order.id}</span>
                        {order.tags.map((tag) => (
                          <Badge key={tag} variant="ghost">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{order.sellerId}</p>
                      <p className="text-xs text-muted-foreground">Seller account</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariantByStatus[order.status] ?? "outline"}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{order.total}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{order.lastActivity}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/orders/${order.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Data source: `/orders` filtered by stage and current buyer.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/notifications">Open notifications</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
            <CardDescription>Latest events from `/notifications`.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px] rounded-2xl border border-border">
              <div className="flex flex-col gap-3 p-4">
                {notificationsQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : null}

                {notificationsQuery.isError ? (
                  <p className="text-xs text-destructive">Unable to load recent notifications.</p>
                ) : null}

                {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No notifications available yet.</p>
                ) : null}

                {notifications.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-muted/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(event.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.body}</p>
                    <Badge variant={notificationToneVariant[event.type]}>{event.type}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Notification stream is now API-driven.</p>
            <Button variant="ghost" size="sm" onClick={() => void notificationsQuery.refetch()}>
              Reload stream
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
