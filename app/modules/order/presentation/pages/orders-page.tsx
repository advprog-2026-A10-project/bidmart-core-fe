"use client";

import * as React from "react";

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

type OrderRow = {
  id: string;
  item: string;
  stage: OrderStage;
  customer: string;
  status: string;
  amount: string;
  lastActivity: string;
  tags: string[];
};

type NotificationTone = "bid" | "winner" | "system" | "alert";

const sampleOrders: OrderRow[] = [
  {
    id: "ORD-2048",
    item: "Banksy - Shredded Beauty",
    stage: "active",
    customer: "VEL (Buyer)",
    status: "Awaiting Payment",
    amount: "$25,400,000",
    lastActivity: "2 minutes ago",
    tags: ["Escrow pending", "Anti-sniping"],
  },
  {
    id: "ORD-1992",
    item: "Banksy - Flower Thrower",
    stage: "active",
    customer: "KRL (Buyer)",
    status: "Awaiting Payment",
    amount: "$1,250,000",
    lastActivity: "6 minutes ago",
    tags: ["Proxy bid", "High velocity"],
  },
  {
    id: "ORD-1901",
    item: "Banksy - Love is in the Air",
    stage: "processing",
    customer: "ADR (Seller)",
    status: "In Transit",
    amount: "$8,300,000",
    lastActivity: "14 minutes ago",
    tags: ["Courier: FedEx", "Signature required"],
  },
  {
    id: "ORD-1830",
    item: "Banksy - Peacekeeper",
    stage: "processing",
    customer: "DDL (Seller)",
    status: "Needs Confirmation",
    amount: "$3,720,000",
    lastActivity: "23 minutes ago",
    tags: ["Delivery pending", "Tracking live"],
  },
  {
    id: "ORD-1758",
    item: "Banksy - Visual Protest",
    stage: "completed",
    customer: "VEL (Buyer)",
    status: "Delivered",
    amount: "$9,100,000",
    lastActivity: "1 day ago",
    tags: ["Receipt archived", "Survey sent"],
  },
  {
    id: "ORD-1703",
    item: "Banksy - Tagger",
    stage: "completed",
    customer: "KRL (Buyer)",
    status: "Dispute Closed",
    amount: "$4,400,000",
    lastActivity: "2 days ago",
    tags: ["Refunded", "Lessons logged"],
  },
];

const notificationEvents: Array<{
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  tone: NotificationTone;
}> = [
  {
    id: "evt-1",
    title: "BidPlaced � Banksy Shredded Beauty",
    detail: "VEL increased the bid to $26M; anti-sniping clock extended two minutes.",
    timestamp: "Just now",
    tone: "bid",
  },
  {
    id: "evt-2",
    title: "WinnerDetermined � Banksy Tagger",
    detail: "KRL won the lot; funds reserved and order created for confirmation.",
    timestamp: "12 minutes ago",
    tone: "winner",
  },
  {
    id: "evt-3",
    title: "OrderReminder � Banksy Peacekeeper",
    detail: "Courier ADR notified to confirm pickup window for courier leg.",
    timestamp: "35 minutes ago",
    tone: "system",
  },
  {
    id: "evt-4",
    title: "DisputeAlert � Banksy Flower Thrower",
    detail: "Seller reported mismatch between tracking data and insurance record.",
    timestamp: "1 hour ago",
    tone: "alert",
  },
];

const badgeVariantByStatus: Record<string, "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
  "Awaiting Payment": "outline",
  "In Transit": "default",
  "Needs Confirmation": "secondary",
  Delivered: "ghost",
  "Dispute Closed": "ghost",
  "Dispute Alert": "destructive",
};

const notificationToneLabel: Record<NotificationTone, string> = {
  bid: "BidPlaced",
  winner: "WinnerDetermined",
  system: "System",
  alert: "Alert",
};

const notificationToneVariant: Record<NotificationTone, "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
  bid: "secondary",
  winner: "default",
  system: "outline",
  alert: "destructive",
};

export default function OrdersPage() {
  const [selectedStage, setSelectedStage] = React.useState<OrderStage>(stageFilters[0].value);

  const filteredOrders = sampleOrders.filter((order) => order.stage === selectedStage);
  const stageDescription = stageFilters.find((stage) => stage.value === selectedStage)?.description;

  const summaryStats = [
    {
      title: "Live orders",
      value: `${sampleOrders.filter((order) => order.stage === "active").length}`,
      trend: "+2 vs last checkpoint",
      description: "Winning bids that are waiting for payment or escrow captures.",
    },
    {
      title: "In flight",
      value: `${sampleOrders.filter((order) => order.stage === "processing").length}`,
      trend: "Ready to ship",
      description: "Courier handoffs and confirmations being watched live.",
    },
    {
      title: "Settled",
      value: `${sampleOrders.filter((order) => order.stage === "completed").length}`,
      trend: "Stable",
      description: "Delivered or archived orders that are fully reconciled.",
    },
  ];

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Order center</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders & notifications</h1>
          <p className="text-sm text-muted-foreground">
            Track every order lifecycle, ensure notification delivery, and keep the BidMart marketplace synchronized.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Sync statuses
          </Button>
          <Button size="sm">Create order</Button>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{order.item}</p>
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
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">Auction module</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariantByStatus[order.status] ?? "outline"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{order.amount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{order.lastActivity}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Updated from Auction, Wallet, and Notification modules every 30 seconds.
            </p>
            <Button size="sm" variant="outline">
              Export CSV
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
            <CardDescription>Streams that triggered order state changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px] rounded-2xl border border-border">
              <div className="flex flex-col gap-3 p-4">
                {notificationEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-muted/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.detail}</p>
                    <Badge variant={notificationToneVariant[event.tone]}>
                      {notificationToneLabel[event.tone]}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Notifications are persisted, deduped, and ready for downstream consumers.</p>
            <Button size="sm" variant="ghost">
              View stream
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
