"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import type { Order, OrderStage } from "~/modules/order/domain/entities/order";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";

const QUERY_KEY_SELLER_ORDERS = "seller-orders-page-orders";

const stageFilters: Array<{ value: "all" | OrderStage; label: string; helper: string }> = [
  { value: "all", label: "All", helper: "Every order in your seller queue." },
  { value: "active", label: "Active", helper: "Awaiting payment and pre-fulfillment." },
  { value: "processing", label: "Processing", helper: "Orders currently being shipped." },
  { value: "completed", label: "Completed", helper: "Finished orders and closed lifecycle." },
  { value: "cancelled", label: "Cancelled", helper: "Cancelled or refunded orders." },
];

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

function compactId(value: string) {
  if (value.length < 14) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export default function SellerOrdersPage() {
  const [selectedStage, setSelectedStage] = React.useState<"all" | OrderStage>("all");
  const useCases = React.useMemo(() => getOrderUseCases(), []);

  const ordersQuery = useQuery({
    queryKey: [QUERY_KEY_SELLER_ORDERS, selectedStage],
    queryFn: () =>
      useCases.listOrders.execute({
        role: "seller",
        stage: selectedStage === "all" ? undefined : selectedStage,
      }),
  });

  const ordersLoadErrorMessage = getOrderUiErrorMessage(
    ordersQuery.error,
    "Unable to load seller orders right now.",
  );

  const orders = ordersQuery.data ?? [];
  const activeCount = orders.filter((order) => order.stage === "active").length;
  const processingCount = orders.filter((order) => order.stage === "processing").length;
  const completedCount = orders.filter((order) => order.stage === "completed").length;

  const stageHelper = stageFilters.find((filter) => filter.value === selectedStage)?.helper;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">Seller portal</p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Seller orders</h1>
          <p className="text-muted-foreground text-sm">
            Track buyer orders and move fulfillment without leaving this workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void ordersQuery.refetch()}>
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/notifications">Open notifications</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active</CardTitle>
            <CardDescription>Orders waiting for shipment action.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{activeCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processing</CardTitle>
            <CardDescription>Orders in transit or pending buyer confirmation.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{processingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed</CardTitle>
            <CardDescription>Orders that already reached final state.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Order board</CardTitle>
            <Badge variant="outline">{selectedStage.toUpperCase()}</Badge>
          </div>
          <CardDescription>{stageHelper}</CardDescription>
          <Tabs
            value={selectedStage}
            onValueChange={(value) => setSelectedStage(value as "all" | OrderStage)}
          >
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
                <TableHead>Lot</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Last activity</TableHead>
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
                  <TableCell colSpan={6} className="text-destructive text-sm">
                    {ordersLoadErrorMessage}
                  </TableCell>
                </TableRow>
              ) : null}

              {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-sm">
                    No seller orders found for this filter.
                  </TableCell>
                </TableRow>
              ) : null}

              {orders.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="space-y-1">
                    <p className="text-foreground text-sm font-semibold">{order.lot}</p>
                    <p className="text-muted-foreground text-xs">Order {compactId(order.id)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{compactId(order.buyerId)}</p>
                    <p className="text-muted-foreground text-xs">Buyer account</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badgeVariantByStatus[order.status] ?? "outline"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{order.total}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {order.lastActivity}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/seller/orders/${order.id}`}>Detail</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/seller/orders/${order.id}/shipping`}>Shipping</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="text-muted-foreground text-xs">
          API source: `GET /seller/orders` with optional `stage` query.
        </CardFooter>
      </Card>
    </div>
  );
}
