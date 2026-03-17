import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Gavel,
  ListOrdered,
  ShieldCheck,
  TimerReset,
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
import { CountdownTimer } from "../components/countdown-timer";
import {
  type AuctionDetail,
  type AuctionStatus,
  type BidHistoryEntry,
  BIDDING_MOCK_PAYLOADS,
} from "./constant";

const AUCTION_HISTORY_QUERY_KEY = "auction-history";

function delay(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatDateTimeWithMs(value: string) {
  const date = new Date(value);

  return `${new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date)}.${String(date.getMilliseconds()).padStart(3, "0")}`;
}

function truncateId(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function sortBidHistory(bids: BidHistoryEntry[]) {
  return [...bids].sort((left, right) => {
    const acceptedAtDifference =
      new Date(right.acceptedAt).getTime() - new Date(left.acceptedAt).getTime();

    if (acceptedAtDifference !== 0) {
      return acceptedAtDifference;
    }

    return right.receivedSequence - left.receivedSequence;
  });
}

function getAuctionHistoryMock(auctionId: string) {
  const basePayload = BIDDING_MOCK_PAYLOADS.getAuctionHistory.response;
  const baseAuction = basePayload.auction;

  let auction: AuctionDetail;

  if (!auctionId || auctionId === baseAuction.id) {
    auction = { ...baseAuction };
  } else {
    auction = {
      ...baseAuction,
      id: auctionId,
      listingId: `listing-${auctionId}`,
      title: `Auction Lot ${auctionId.toUpperCase()}`,
    } satisfies AuctionDetail;
  }

  return {
    auction,
    bids: basePayload.bids.map((bid) => ({
      ...bid,
      auctionId: auction.id,
    })),
    ordering: basePayload.ordering,
  };
}

function getEffectiveStatus(auction: AuctionDetail): AuctionStatus {
  if (auction.status === "ACTIVE" && auction.extensionCount > 0) {
    return "EXTENDED";
  }

  return auction.status;
}

function getAuctionStatusBadgeClasses(status: AuctionStatus) {
  switch (status) {
    case "DRAFT":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "SCHEDULED":
      return "border-blue-200 bg-blue-100 text-blue-800";
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "EXTENDED":
      return "border-amber-200 bg-amber-100 text-amber-800";
    case "CLOSED":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "WON":
      return "border-violet-200 bg-violet-100 text-violet-800";
    case "UNSOLD":
      return "border-rose-200 bg-rose-100 text-rose-800";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getAuctionStatusLabel(status: AuctionStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SCHEDULED":
      return "Scheduled";
    case "ACTIVE":
      return "Live";
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

function getBidStatusBadgeClasses(entry: BidHistoryEntry) {
  if (entry.status === "LEADING") {
    return "border-emerald-200 bg-emerald-100 text-emerald-800";
  }

  if (entry.isMyBid) {
    return "border-violet-200 bg-violet-100 text-violet-800";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getBidStatusLabel(entry: BidHistoryEntry) {
  if (entry.status === "LEADING") {
    return "Leading";
  }

  if (entry.isMyBid) {
    return "Your bid";
  }

  return "Outbid";
}

function isNearSimultaneous(bids: BidHistoryEntry[], index: number) {
  const current = bids[index];
  const previous = bids[index - 1];
  const next = bids[index + 1];

  return Boolean(
    (previous && previous.acceptedAt === current.acceptedAt) ||
    (next && next.acceptedAt === current.acceptedAt),
  );
}

function HistorySkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="aspect-4/3 w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuctionsHistoryPage() {
  const params = useParams();
  const auctionId = params.auctionId ?? BIDDING_MOCK_PAYLOADS.mockAuction.id;

  const historyQuery = useQuery({
    queryKey: [AUCTION_HISTORY_QUERY_KEY, auctionId],
    queryFn: async () => {
      await delay(300);
      return getAuctionHistoryMock(auctionId);
    },
    select: (payload) => ({
      ...payload,
      bids: sortBidHistory(payload.bids),
    }),
    enabled: Boolean(auctionId),
  });

  if (historyQuery.isLoading) {
    return <HistorySkeleton />;
  }

  if (historyQuery.isError || !historyQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Auction history not available</CardTitle>
            <CardDescription>
              We could not load the bid history for this auction right now. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { auction, bids, ordering } = historyQuery.data;
  const effectiveStatus = getEffectiveStatus(auction);
  const reserveMet = auction.reservePrice !== null && auction.currentPrice >= auction.reservePrice;
  const nearSimultaneousCount = bids.filter((_, index) => isNearSimultaneous(bids, index)).length;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Link
              className="hover:text-foreground inline-flex items-center gap-1"
              to={`/auctions/${auction.id}`}
            >
              <ArrowLeft className="size-4" />
              Back to live auction
            </Link>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Auction bid history</h1>
          <p className="text-muted-foreground max-w-3xl text-sm">
            Ordered by <span className="text-foreground font-medium">server acceptance time</span>{" "}
            and then by <span className="text-foreground font-medium">receipt sequence</span> so
            bids that arrive almost at the same time still render in a fair and deterministic order.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to={`/auctions/${auction.id}`}>
            Open live auction
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
              <div className="bg-muted/20 border-b md:border-r md:border-b-0">
                <div className="bg-muted aspect-4/3 h-full w-full">
                  <img
                    alt={auction.title}
                    className="h-full w-full object-cover"
                    src={auction.imageUrl}
                  />
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={getAuctionStatusBadgeClasses(effectiveStatus)}
                    variant="outline"
                  >
                    {getAuctionStatusLabel(effectiveStatus)}
                  </Badge>
                  <Badge variant="outline">Auction {truncateId(auction.id)}</Badge>
                  <Badge variant="outline">Listing {truncateId(auction.listingId)}</Badge>
                  <Badge variant="outline">{auction.bidCount} bids</Badge>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{auction.title}</h2>
                  <p className="text-muted-foreground text-sm leading-6">{auction.description}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="bg-muted/30 rounded-lg border p-4">
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <Gavel className="size-4" />
                      Current highest bid
                    </div>
                    <p className="text-xl font-semibold">{formatCurrency(auction.currentPrice)}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Leading bidder: {auction.highestBidderAlias}
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg border p-4">
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <Clock3 className="size-4" />
                      Time remaining
                    </div>
                    <p className="text-xl font-semibold">
                      <CountdownTimer endsAt={auction.endsAt} />
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Ends {formatDateTime(auction.endsAt)}
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg border p-4">
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <TimerReset className="size-4" />
                      Extension policy
                    </div>
                    <p className="text-xl font-semibold">+2 minutes</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Triggered {auction.extensionCount} time
                      {auction.extensionCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg border p-4">
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <ShieldCheck className="size-4" />
                      Reserve status
                    </div>
                    <p className="text-xl font-semibold">{reserveMet ? "Met" : "Not met"}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Reserve {auction.reservePrice ? formatCurrency(auction.reservePrice) : "None"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ordering rules</CardTitle>
            <CardDescription>
              This mock is shaped like the future backend response so the page can move to real data
              without changing the UI contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="bg-muted/20 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <ListOrdered className="size-4" />
                Applied ordering
              </div>
              <p className="text-muted-foreground">
                Latest first by{" "}
                <span className="text-foreground font-medium">{ordering.primary}</span>, then by{" "}
                <span className="text-foreground font-medium">{ordering.secondary}</span>.
              </p>
            </div>

            <div className="bg-muted/20 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <UserRound className="size-4" />
                Fairness note
              </div>
              <p className="text-muted-foreground">
                {nearSimultaneousCount > 0
                  ? `${nearSimultaneousCount} rows in this history share the same acceptance timestamp, so their server receipt sequence is used as the tie-breaker.`
                  : "No near-simultaneous bids were detected in this history."}
              </p>
            </div>

            <Separator />

            <div className="text-muted-foreground space-y-2">
              <p>Seller: {auction.sellerName}</p>
              <p>Starts at: {formatDateTime(auction.startsAt)}</p>
              <p>Original end: {formatDateTime(auction.originalEndsAt)}</p>
              <p>Increment: {formatCurrency(auction.bidIncrement)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bid timeline</CardTitle>
          <CardDescription>
            The latest accepted bid appears first. Ties are resolved by receipt sequence so the
            order stays stable and auditable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="min-w-240">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-18">Order</TableHead>
                    <TableHead>Bidder</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Placed at</TableHead>
                    <TableHead>Accepted at</TableHead>
                    <TableHead className="w-30">Sequence</TableHead>
                    <TableHead className="w-45">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((entry, index) => {
                    const nearSimultaneous = isNearSimultaneous(bids, index);

                    return (
                      <TableRow
                        key={entry.id}
                        className={entry.isMyBid ? "bg-violet-50/60" : undefined}
                      >
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{entry.bidderAlias}</span>
                            {entry.isMyBid ? <Badge variant="outline">You</Badge> : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell>{formatDateTimeWithMs(entry.placedAt)}</TableCell>
                        <TableCell>{formatDateTimeWithMs(entry.acceptedAt)}</TableCell>
                        <TableCell>#{entry.receivedSequence}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={getBidStatusBadgeClasses(entry)} variant="outline">
                              {getBidStatusLabel(entry)}
                            </Badge>
                            {nearSimultaneous ? (
                              <Badge variant="outline">Tie-break applied</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
