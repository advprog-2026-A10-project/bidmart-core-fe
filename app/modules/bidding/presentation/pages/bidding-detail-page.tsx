import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Gavel,
  ShieldAlert,
  TimerReset,
  Trophy,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router";

import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { ScrollArea } from "~/shared/components/ui/scroll-area";
import { Separator } from "~/shared/components/ui/separator";
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { getBiddingUseCases } from "~/modules/bidding/infrastructure";
import type {
  AuctionHistory,
  AuctionStatus,
  MyBidDetail,
  MyBidStatus,
} from "~/modules/bidding/domain/entities/bidding";
import type { BidActivityType, BidDetail } from "./bid-detail.constant";

const BID_DETAIL_QUERY_KEY = "bid-detail";

function formatCurrency(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCountdownLabel(endsAt: string) {
  const diffMs = new Date(endsAt).getTime() - Date.now();

  if (diffMs <= 0) {
    return "Auction already ended";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s remaining`;
}

function getAuctionStatusLabel(status: AuctionStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SCHEDULED":
      return "Scheduled";
    case "ACTIVE":
      return "Active";
    case "EXTENDED":
      return "Extended";
    case "CLOSED":
      return "Closed";
    case "WON":
      return "Won";
    case "UNSOLD":
      return "Unsold";
    default:
      return status;
  }
}

function getAuctionStatusBadgeClasses(status: AuctionStatus) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "EXTENDED":
      return "border-amber-200 bg-amber-100 text-amber-900";
    case "WON":
      return "border-violet-200 bg-violet-100 text-violet-900";
    case "UNSOLD":
      return "border-rose-200 bg-rose-100 text-rose-900";
    case "SCHEDULED":
      return "border-blue-200 bg-blue-100 text-blue-900";
    case "CLOSED":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "DRAFT":
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getMyStatusLabel(status: MyBidStatus) {
  switch (status) {
    case "WINNING":
      return "Winning";
    case "OUTBID":
      return "Outbid";
    case "WON":
      return "Won";
    case "LOST":
      return "Lost";
    default:
      return status;
  }
}

function getMyStatusBadgeClasses(status: MyBidStatus) {
  switch (status) {
    case "WINNING":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "OUTBID":
      return "border-amber-200 bg-amber-100 text-amber-900";
    case "WON":
      return "border-violet-200 bg-violet-100 text-violet-900";
    case "LOST":
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getActivityTypeLabel(type: BidActivityType) {
  switch (type) {
    case "PLACED_BID":
      return "Placed bid";
    case "OUTBID":
      return "Outbid";
    case "LEADING":
      return "Leading";
    case "EXTENDED":
      return "Extended";
    case "CLOSED":
      return "Closed";
    case "RESULT_CONFIRMED":
      return "Result confirmed";
    default:
      return type;
  }
}

function getOutcomeCopy(detail: BidDetail) {
  if (detail.myBidStatus === "WINNING") {
    return `You are currently leading at ${formatCurrency(detail.myLatestBid)}.`;
  }

  if (detail.myBidStatus === "OUTBID") {
    return `You are ${formatCurrency(detail.winningGap)} behind the current highest accepted bid.`;
  }

  if (detail.myBidStatus === "WON") {
    return `Winning result confirmed at ${formatCurrency(detail.auction.currentPrice)}.`;
  }

  if (detail.auction.status === "UNSOLD") {
    return "The lot closed below reserve and no winner was assigned.";
  }

  if (detail.auction.winnerName) {
    return `${detail.auction.winnerName} finished as the confirmed winner.`;
  }

  return "Your bid did not finish on top.";
}

function buildSummary(status: MyBidStatus, winningGap: number): { headline: string; body: string } {
  switch (status) {
    case "WINNING":
      return {
        headline: "You are currently leading this auction.",
        body: "Your latest accepted bid is currently the highest. Keep monitoring the timer in case another bidder responds.",
      };
    case "OUTBID":
      return {
        headline: "You are currently outbid.",
        body: `Another bidder is leading. You need at least ${formatCurrency(winningGap)} more to catch up to the current highest bid.`,
      };
    case "WON":
      return {
        headline: "You won this auction.",
        body: "The auction is closed and your bid finished as the winning bid.",
      };
    case "LOST":
    default:
      return {
        headline: "You did not win this auction.",
        body: "The auction has ended and another bidder finished on top.",
      };
  }
}

function mapDetailToView(detail: MyBidDetail, history: AuctionHistory): { detail: BidDetail } {
  const myBidStatus = detail.myBidStatus;
  const auctionStatus = detail.auction.status;
  const historyPreview = history.bids.slice(0, 5).map((entry) => ({
    id: entry.id,
    bidderAlias: entry.bidderAlias,
    amount: entry.amount,
    acceptedAt: entry.acceptedAt,
    isMyBid: entry.isMyBid,
  }));

  const timelineAmounts = detail.timeline
    .map((entry) => entry.amount)
    .filter((amount): amount is number => typeof amount === "number");
  const myHighestBid =
    timelineAmounts.length > 0 ? Math.max(...timelineAmounts) : detail.myLatestBid;
  const myLastBidAt =
    detail.timeline.find((entry) => typeof entry.amount === "number")?.at ??
    detail.auction.createdAt;

  const activities = detail.timeline.map((entry, index) => ({
    id: `activity-${index}`,
    type: sanitizeActivityType(entry.type),
    actorId: entry.type === "OUTBID" ? null : "me",
    actorName: entry.type === "OUTBID" ? "System" : "You",
    amount: entry.amount,
    at: entry.at,
    note: entry.note,
    isMyAction: entry.type !== "OUTBID",
  }));

  const minimumNextBid =
    auctionStatus === "ACTIVE" || auctionStatus === "EXTENDED"
      ? detail.auction.currentPrice + detail.auction.bidIncrement
      : null;

  return {
    detail: {
      auction: {
        id: detail.auction.id,
        listingId: detail.auction.listingId,
        sellerId: detail.auction.sellerId,
        sellerName: detail.auction.sellerName,
        title: detail.auction.title,
        description: detail.auction.description,
        imageUrl: detail.auction.imageUrl,
        startPrice: detail.auction.startPrice,
        currentPrice: detail.auction.currentPrice,
        reservePrice: detail.auction.reservePrice,
        bidIncrement: detail.auction.bidIncrement,
        bidCount: detail.auction.bidCount,
        status: auctionStatus,
        winnerId: detail.auction.winnerId,
        winnerName: detail.auction.winnerName,
        startsAt: detail.auction.startsAt,
        endsAt: detail.auction.endsAt,
        originalEndsAt: detail.auction.originalEndsAt,
        extensionCount: detail.auction.extensionCount,
        createdAt: detail.auction.createdAt,
        currency: "IDR",
        highestBidderAlias: detail.auction.highestBidderAlias,
      },
      myBidStatus,
      myLatestBid: detail.myLatestBid,
      myHighestBid,
      myBidCount: detail.placedBidCount,
      myLastBidAt,
      myRank: null,
      isReserveMet: detail.isReserveMet,
      minimumNextBid,
      canBidAgain: auctionStatus === "ACTIVE" || auctionStatus === "EXTENDED",
      winningGap: detail.winningGap,
      summary: buildSummary(myBidStatus, detail.winningGap),
      historyPreview,
      activities,
    },
  };
}

function sanitizeActivityType(type: string): BidActivityType {
  switch (type) {
    case "PLACED_BID":
    case "OUTBID":
    case "LEADING":
    case "EXTENDED":
    case "CLOSED":
    case "RESULT_CONFIRMED":
      return type;
    default:
      return "PLACED_BID";
  }
}

function SummaryMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-muted-foreground text-xs leading-5">{helper}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-10 w-40" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  );
}

export default function BiddingDetailPage() {
  const { auctionId = "" } = useParams();

  const useCases = getBiddingUseCases();

  const bidDetailQuery = useQuery({
    queryKey: [BID_DETAIL_QUERY_KEY, auctionId],
    queryFn: async () => {
      const [detail, history] = await Promise.all([
        useCases.getMyBidDetail.execute({ auctionId }),
        useCases.getAuctionHistory.execute({ auctionId }),
      ]);
      return mapDetailToView(detail, history);
    },
    enabled: Boolean(auctionId),
    staleTime: 60_000,
  });

  if (bidDetailQuery.isLoading) {
    return <LoadingState />;
  }

  if (bidDetailQuery.isError || !bidDetailQuery.data?.detail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Bid detail not available</CardTitle>
            <CardDescription>
              We could not load the bid detail for this auction right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/me/bids">
                <ArrowLeft className="mr-2 size-4" />
                Back to my bids
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { detail } = bidDetailQuery.data;
  const { auction } = detail;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link to="/me/bids">
            <ArrowLeft className="mr-2 size-4" />
            Back to my bids
          </Link>
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/auctions/${auction.id}`}>
              Open auction page
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/auctions/${auction.id}/history`}>View full auction history</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden py-0">
          <div className="bg-muted aspect-[4/3] overflow-hidden">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="h-full w-full object-cover"
            />
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getAuctionStatusBadgeClasses(auction.status)}>
                {getAuctionStatusLabel(auction.status)}
              </Badge>
              <Badge variant="outline" className={getMyStatusBadgeClasses(detail.myBidStatus)}>
                {getMyStatusLabel(detail.myBidStatus)}
              </Badge>
              {detail.isReserveMet ? (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-100 text-emerald-800"
                >
                  Reserve met
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-200 bg-amber-100 text-amber-900">
                  Reserve not met
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">{auction.title}</h1>
              <p className="text-muted-foreground text-sm leading-6">{auction.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-muted/30 rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <UserRound className="size-4" />
                  Seller information
                </div>
                <p className="text-muted-foreground text-sm">{auction.sellerName}</p>
                <p className="text-muted-foreground mt-1 text-xs">Seller ID: {auction.sellerId}</p>
              </div>

              <div className="bg-muted/30 rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <CalendarClock className="size-4" />
                  Auction timing
                </div>
                <p className="text-muted-foreground text-sm">
                  Starts: {formatDateTime(auction.startsAt)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ends: {formatDateTime(auction.endsAt)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Original close: {formatDateTime(auction.originalEndsAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {detail.myBidStatus === "WINNING" || detail.myBidStatus === "WON" ? (
                  <Trophy className="size-5" />
                ) : (
                  <ShieldAlert className="size-5" />
                )}
                Your position
              </CardTitle>
              <CardDescription>{detail.summary.headline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-6">{detail.summary.body}</p>
              <div className="bg-muted/30 rounded-xl border p-4">
                <p className="text-sm font-medium">Outcome snapshot</p>
                <p className="text-muted-foreground mt-1 text-sm">{getOutcomeCopy(detail)}</p>
              </div>
              <div className="bg-muted/30 rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TimerReset className="size-4" />
                  Live timing
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {auction.status === "ACTIVE" || auction.status === "EXTENDED"
                    ? formatCountdownLabel(auction.endsAt)
                    : `Closed at ${formatDateTime(auction.endsAt)}`}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Extension count: {auction.extensionCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="size-5" />
                Bid comparison
              </CardTitle>
              <CardDescription>Buyer-centric detail for this specific auction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="text-muted-foreground text-sm">Your latest bid</p>
                  <p className="text-xl font-semibold">{formatCurrency(detail.myLatestBid)}</p>
                </div>
                <Badge variant="outline" className={getMyStatusBadgeClasses(detail.myBidStatus)}>
                  {getMyStatusLabel(detail.myBidStatus)}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="text-muted-foreground text-sm">Current highest</p>
                  <p className="text-xl font-semibold">{formatCurrency(auction.currentPrice)}</p>
                </div>
                <p className="text-muted-foreground text-sm">{auction.highestBidderAlias}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-muted-foreground text-sm">Gap to lead</p>
                  <p className="text-xl font-semibold">{formatCurrency(detail.winningGap)}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-muted-foreground text-sm">Next valid bid</p>
                  <p className="text-xl font-semibold">{formatCurrency(detail.minimumNextBid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          label="My highest bid"
          value={formatCurrency(detail.myHighestBid)}
          helper="Highest amount you submitted for this auction."
        />
        <SummaryMetric
          label="My bid count"
          value={String(detail.myBidCount)}
          helper="Number of accepted bids associated with your account."
        />
        <SummaryMetric
          label="Bid increment"
          value={formatCurrency(auction.bidIncrement)}
          helper="Minimum increment that every new valid bid must satisfy."
        />
        <SummaryMetric
          label="Bid count"
          value={String(auction.bidCount)}
          helper="Total accepted bids recorded on this auction."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Auction and bid detail</CardTitle>
            <CardDescription>
              Schema-aligned fields you can later bind directly to backend payloads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Auction ID</p>
                <p className="font-medium">{auction.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Listing ID</p>
                <p className="font-medium">{auction.listingId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Created at</p>
                <p className="font-medium">{formatDateTime(auction.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">My last bid at</p>
                <p className="font-medium">{formatDateTime(detail.myLastBidAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Start price</p>
                <p className="font-medium">{formatCurrency(auction.startPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Reserve price</p>
                <p className="font-medium">{formatCurrency(auction.reservePrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Winner</p>
                <p className="font-medium">{auction.winnerName ?? "Not assigned"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Current rank</p>
                <p className="font-medium">{detail.myRank ? `#${detail.myRank}` : "—"}</p>
              </div>
            </div>

            <Separator />

            <div className="bg-muted/30 rounded-xl border p-4">
              <p className="text-sm font-medium">Behavior summary</p>
              <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
                <li>
                  Every bid follows English auction rules: a valid bid must exceed the current
                  highest accepted price by at least one increment.
                </li>
                <li>
                  Late valid bids near the deadline trigger a 2-minute extension so buyers still
                  have a fair chance to respond.
                </li>
                <li>
                  Buyer-facing status here is separate from `auction.status`: it represents your own
                  position in the auction, not only the auction lifecycle.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent actions</CardTitle>
            <CardDescription>
              Detailed activity feed for this auction from your bidding perspective.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px] pr-4">
              <div className="space-y-4">
                {detail.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="hover:bg-muted/20 rounded-xl border p-4 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            activity.isMyAction
                              ? "border-blue-200 bg-blue-100 text-blue-900"
                              : undefined
                          }
                        >
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                        {activity.isMyAction ? (
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-100 text-blue-900"
                          >
                            Your action
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-xs">{formatDateTime(activity.at)}</p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="font-medium">{activity.actorName}</p>
                      <p className="text-muted-foreground text-sm">{activity.note}</p>
                      <p className="text-sm font-medium">
                        Amount: {formatCurrency(activity.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accepted bid preview</CardTitle>
          <CardDescription>
            Compact preview of the latest accepted bids before you open the full history page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidder</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Accepted at</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.historyPreview.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.bidderAlias}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(entry.amount)}</TableCell>
                  <TableCell>{formatDateTime(entry.acceptedAt)}</TableCell>
                  <TableCell>
                    {entry.isMyBid ? (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-100 text-blue-900"
                      >
                        Your bid
                      </Badge>
                    ) : (
                      <Badge variant="outline">Accepted</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-5" />
            Backend handoff note
          </CardTitle>
          <CardDescription>
            This page now reads backend bid-detail and auction-history endpoints using a route-param
            query key.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
