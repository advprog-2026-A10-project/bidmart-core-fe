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

const stageFilters: Array<{ value: "all" | OrderStage; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

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

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Seller portal</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Seller orders</h1>
          <p className="text-sm text-muted-foreground">
            Monitor all buyer orders connected to your listings.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void ordersQuery.refetch()}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Order board</CardTitle>
          <CardDescription>Source: `/seller/orders` with optional stage filter.</CardDescription>
          <Tabs value={selectedStage} onValueChange={(value) => setSelectedStage(value as "all" | OrderStage)}>
            <TabsList>
              {stageFilters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="px-0">
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
                  <TableCell colSpan={6} className="text-sm text-destructive">
                    {ordersLoadErrorMessage}
                  </TableCell>
                </TableRow>
              ) : null}

              {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No orders found for this filter.
                  </TableCell>
                </TableRow>
              ) : null}

              {orders.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{order.lot}</p>
                    <p className="text-xs text-muted-foreground">{order.id}</p>
                  </TableCell>
                  <TableCell>{order.buyerId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{order.total}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{order.lastActivity}</TableCell>
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
      </Card>
    </div>
  );
}
