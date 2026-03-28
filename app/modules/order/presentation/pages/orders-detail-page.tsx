"use client";

import * as React from "react";

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
import { ScrollArea } from "~/shared/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

const orderDetail = {
  id: "ORD-2048",
  lot: "Banksy - Shredded Beauty",
  status: "Awaiting Payment",
  total: "$25,400,000",
  endsAt: "Mar 25, 2026 · 23:59 GMT+7",
  created: "Mar 22, 2026 · 09:41 GMT+7",
  auction: "English Auction · Anti-sniping enabled",
  buyerNote: "Auto-bid ceiling: $26M",
};

const paymentDetails = [
  { label: "Payment hold", value: "$24,900,000", meta: "Escrow released when funds settle" },
  { label: "Deposit", value: "$500,000", meta: "Captured via gateway" },
  { label: "Gateway", value: "BitPay Escrow", meta: "2FA & signature verified" },
];

const shippingDetails = [
  { label: "Carrier", value: "FedEx Express", meta: "Tracking · 1234 5678 9012" },
  { label: "Delivery window", value: "Mar 26 - 28, 2026", meta: "Eastern Europe route" },
  { label: "Fulfillment", value: "ADR Logistics", meta: "Verified handler" },
];

const timelineEvents = [
  {
    id: "tl-1",
    title: "BidPlaced · Shredded Beauty",
    detail: "VEL bumped the price to $26M and the auction extended 2 minutes.",
    timestamp: "Just now",
    tone: "bid",
  },
  {
    id: "tl-2",
    title: "PaymentHold · BitPay",
    detail: "Escrow locked $24.9M once the bid stopped at $26M.",
    timestamp: "3 minutes ago",
    tone: "transaction",
  },
  {
    id: "tl-3",
    title: "ShipmentScheduled · ADR",
    detail: "Pickup scheduled; tracking label created.",
    timestamp: "27 minutes ago",
    tone: "shipping",
  },
  {
    id: "tl-4",
    title: "OrderCreated · Market",
    detail: "Order record seeded in BidMart central ledger.",
    timestamp: "43 minutes ago",
    tone: "system",
  },
];

type TimelineTone = (typeof timelineEvents)[number]["tone"];

const timelineToneVariant: Record<TimelineTone, "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
  bid: "secondary",
  transaction: "default",
  shipping: "outline",
  system: "ghost",
};

const participants = [
  { name: "VEL", role: "Buyer", status: "Active" },
  { name: "ADR", role: "Seller", status: "Verified" },
  { name: "KRL", role: "Auctioneer", status: "Monitoring" },
];

const breakdownRows = [
  { label: "Hammer price", value: "$25,000,000", notes: "Base model + premium" },
  { label: "Marketplace fee (2%)", value: "$500,000", notes: "Escrow + notifications" },
  { label: "Shipping hold", value: "$100,000", notes: "Insured artwork" },
  { label: "Net payout", value: "$24,400,000", notes: "To seller after release" },
];

export default function OrdersDetailPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Order</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {orderDetail.lot}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">{orderDetail.status}</Badge>
            <span>Order #{orderDetail.id}</span>
            <span>Ends {orderDetail.endsAt}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Capture payment
          </Button>
          <Button size="sm">Share</Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Snapshot</CardTitle>
            <CardDescription>Key metadata for this order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold text-foreground">{orderDetail.total}</p>
            <p className="text-xs text-muted-foreground">{orderDetail.created}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Auction</span>
                <span>{orderDetail.auction}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Buyer note</span>
                <span>{orderDetail.buyerNote}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Escrow + capture status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentDetails.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between text-sm">
                <div className="text-xs text-muted-foreground">{detail.label}</div>
                <div className="text-right">
                  <p className="font-medium">{detail.value}</p>
                  <p className="text-xs text-muted-foreground">{detail.meta}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfillment</CardTitle>
            <CardDescription>Shipping + logistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {shippingDetails.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between text-sm">
                <div className="text-xs text-muted-foreground">{detail.label}</div>
                <div className="text-right">
                  <p className="font-medium">{detail.value}</p>
                  <p className="text-xs text-muted-foreground">{detail.meta}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Every event that touched this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[360px] rounded-2xl border border-border">
              <div className="flex flex-col gap-4 p-4">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="space-y-1 rounded-2xl border border-border/70 bg-muted/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.detail}</p>
                    <Badge variant={timelineToneVariant[event.tone]}>
                      {event.tone.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>Stakeholders currently monitoring this order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {participants.map((participant) => (
              <div key={participant.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{participant.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">{participant.role}</p>
                  </div>
                </div>
                <Badge variant="outline">{participant.status}</Badge>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Synced 8s ago</span>
            <Button size="sm" variant="ghost">
              Contact support
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial breakdown</CardTitle>
          <CardDescription>Route transparency for the order payout.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdownRows.map((row) => (
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
