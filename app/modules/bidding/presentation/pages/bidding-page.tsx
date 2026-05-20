import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  Gavel,
  ListFilter,
  ShieldAlert,
  Target,
  Trophy,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

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
import { Tabs, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";
import { getBiddingUseCases } from "~/modules/bidding/infrastructure";
import type {
  AuctionStatus,
  MyBidFilterValue,
  MyBidListItem,
  MyBidStatus,
} from "~/modules/bidding/domain/entities/bidding";

const MY_BIDS_QUERY_KEY = "my-bids";
const VALID_FILTERS: MyBidFilterValue[] = ["all", "winning", "outbid", "won", "lost"];

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
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRelativeAuctionTime(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const hours = Math.round(absDiff / (60 * 60 * 1000));

  if (hours < 24) {
    return diff >= 0 ? `Ends in ${hours}h` : `Ended ${hours}h ago`;
  }

  const days = Math.round(absDiff / (24 * 60 * 60 * 1000));
  return diff >= 0 ? `Ends in ${days}d` : `Ended ${days}d ago`;
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
      return "border-amber-200 bg-amber-100 text-amber-800";
    case "WON":
      return "border-violet-200 bg-violet-100 text-violet-800";
    case "UNSOLD":
      return "border-rose-200 bg-rose-100 text-rose-800";
    case "CLOSED":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "SCHEDULED":
      return "border-blue-200 bg-blue-100 text-blue-800";
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
      return "border-amber-200 bg-amber-100 text-amber-800";
    case "WON":
      return "border-violet-200 bg-violet-100 text-violet-800";
    case "LOST":
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getResultCopy(bid: MyBidListItem) {
  if (bid.myBidStatus === "WINNING") {
    return `You are leading at ${formatCurrency(bid.currentPrice)}.`;
  }

  if (bid.myBidStatus === "OUTBID") {
    return `Need at least ${formatCurrency(bid.currentPrice + bid.bidIncrement)} to reclaim the lead.`;
  }

  if (bid.myBidStatus === "WON") {
    return `Winning bid confirmed at ${formatCurrency(bid.currentPrice)}.`;
  }

  if (bid.auctionStatus === "UNSOLD") {
    return "Auction ended unsold because reserve was not met.";
  }

  if (bid.winnerName) {
    return `${bid.winnerName} finished on top.`;
  }

  return "Auction closed without your bid on top.";
}

function SummaryCards({ summary }: { summary: Record<MyBidFilterValue, number> }) {
  const cards = [
    {
      key: "winning",
      title: "Winning",
      value: summary.winning,
      icon: Trophy,
      helper: "Live auctions where your bid is currently highest.",
    },
    {
      key: "outbid",
      title: "Outbid",
      value: summary.outbid,
      icon: ShieldAlert,
      helper: "Live auctions that need another bid to regain the lead.",
    },
    {
      key: "won",
      title: "Won",
      value: summary.won,
      icon: BadgeCheck,
      helper: "Closed auctions that you won.",
    },
    {
      key: "lost",
      title: "Lost",
      value: summary.lost,
      icon: Target,
      helper: "Closed or unsold auctions where you did not win.",
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">{card.title}</p>
                <p className="text-3xl font-semibold tracking-tight">{card.value}</p>
                <p className="text-muted-foreground text-xs leading-5">{card.helper}</p>
              </div>
              <div className="bg-muted/40 rounded-full border p-2">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FilterTabs({
  value,
  summary,
  onValueChange,
}: {
  value: MyBidFilterValue;
  summary: Record<MyBidFilterValue, number>;
  onValueChange: (nextValue: MyBidFilterValue) => void;
}) {
  const options: Array<{ value: MyBidFilterValue; label: string }> = [
    { value: "all", label: "All" },
    { value: "winning", label: "Winning" },
    { value: "outbid", label: "Outbid" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];

  return (
    <Tabs onValueChange={(next) => onValueChange(next as MyBidFilterValue)} value={value}>
      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="inline-flex h-auto w-max gap-2 p-1">
          {options.map((option) => (
            <TabsTrigger className="gap-2 px-3 py-2" key={option.value} value={option.value}>
              <span>{option.label}</span>
              <Badge className="rounded-full" variant="secondary">
                {summary[option.value]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
    </Tabs>
  );
}

function EmptyState({ filter }: { filter: MyBidFilterValue }) {
  const label = filter === "all" ? "any bids yet" : `any ${filter} bids`;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ListFilter className="text-muted-foreground size-10" />
        <div className="space-y-1">
          <h3 className="text-lg font-medium">No matching bids</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            We could not find {label} for your account at the moment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-10 w-56" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-32 w-full" key={index} />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function BiddingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get("status");
  const activeFilter = VALID_FILTERS.includes(rawStatus as MyBidFilterValue)
    ? (rawStatus as MyBidFilterValue)
    : "all";

  const useCases = getBiddingUseCases();

  const myBidsQuery = useQuery({
    queryKey: [MY_BIDS_QUERY_KEY, activeFilter],
    queryFn: () =>
      useCases.listMyBids.execute(
        activeFilter === "all" ? {} : { status: activeFilter },
      ),
  });

  const handleFilterChange = (nextValue: MyBidFilterValue) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      if (nextValue === "all") {
        next.delete("status");
      } else {
        next.set("status", nextValue);
      }

      return next;
    });
  };

  if (myBidsQuery.isLoading) {
    return <LoadingState />;
  }

  if (myBidsQuery.isError || !myBidsQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load your bids</CardTitle>
            <CardDescription>
              The page could not load the bidding history right now. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { user, bids, summary } = myBidsQuery.data;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Gavel className="size-4" />
            <span>{user.name}&rsquo;s bidding activity</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">My bids</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6">
            Filterable bidding history for <code>GET /me/bids</code> and
            <code> GET /me/bids?status=winning|outbid|won|lost</code>. The list keeps the
            buyer-facing bid result separate from the auction&rsquo;s own database status enum, so
            each row can show both{" "}
            <span className="text-foreground font-medium">my bid status</span>
            and <span className="text-foreground font-medium">auction status</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{summary.all} tracked auctions</Badge>
          <Badge variant="outline">Filter: {activeFilter}</Badge>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle>Status filter</CardTitle>
            <CardDescription>
              The query parameter drives the visible list. “Winning” and “Outbid” represent live
              auction position, while “Won” and “Lost” represent final outcomes after closing.
            </CardDescription>
          </div>
          <FilterTabs onValueChange={handleFilterChange} summary={summary} value={activeFilter} />
        </CardHeader>
      </Card>

      {bids.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <>
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle>Bid history table</CardTitle>
              <CardDescription>
                Data is loaded from backend and filtered by your current status tab.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auction</TableHead>
                    <TableHead>My bid</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ends / Result</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((bid) => {
                    const nextValidBid = bid.currentPrice + bid.bidIncrement;
                    const isLive =
                      bid.auctionStatus === "ACTIVE" || bid.auctionStatus === "EXTENDED";

                    return (
                      <TableRow key={bid.auctionId}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <img
                              alt={bid.title}
                              className="h-16 w-16 rounded-lg object-cover"
                              src={bid.imageUrl}
                            />
                            <div className="space-y-1">
                              <p className="leading-5 font-medium">{bid.title}</p>
                              <p className="text-muted-foreground text-sm">{bid.sellerName}</p>
                              <p className="text-muted-foreground max-w-md text-xs leading-5">
                                {bid.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{formatCurrency(bid.myLatestBid)}</p>
                            <p className="text-muted-foreground text-xs">
                              Last bid {formatDateTime(bid.lastBidAt)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{formatCurrency(bid.currentPrice)}</p>
                            <p className="text-muted-foreground text-xs">
                              Next valid bid {formatCurrency(nextValidBid)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-2">
                            <Badge
                              className={getMyStatusBadgeClasses(bid.myBidStatus)}
                              variant="outline"
                            >
                              {getMyStatusLabel(bid.myBidStatus)}
                            </Badge>
                            <Badge
                              className={getAuctionStatusBadgeClasses(bid.auctionStatus)}
                              variant="outline"
                            >
                              {getAuctionStatusLabel(bid.auctionStatus)}
                            </Badge>
                            <p className="text-muted-foreground text-xs">
                              {bid.isReserveMet ? "Reserve met" : "Reserve not met yet"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <p>{formatRelativeAuctionTime(bid.endsAt)}</p>
                            <p className="text-muted-foreground">{formatDateTime(bid.endsAt)}</p>
                            <p className="text-muted-foreground text-xs">{getResultCopy(bid)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {isLive ? (
                              <Button asChild size="sm" variant="outline">
                                <Link to={`/auctions/${bid.auctionId}`}>
                                  Open auction
                                  <ArrowUpRight className="size-4" />
                                </Link>
                              </Button>
                            ) : null}
                            <Button asChild size="sm">
                              <Link to={`/me/bids/${bid.auctionId}`}>View detail</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:hidden">
            {bids.map((bid) => {
              const isLive = bid.auctionStatus === "ACTIVE" || bid.auctionStatus === "EXTENDED";
              const nextValidBid = bid.currentPrice + bid.bidIncrement;

              return (
                <Card key={bid.auctionId} className="overflow-hidden">
                  <div className="grid gap-0 sm:grid-cols-[140px_minmax(0,1fr)]">
                    <div className="bg-muted aspect-4/3">
                      <img
                        alt={bid.title}
                        className="h-full w-full object-cover"
                        src={bid.imageUrl}
                      />
                    </div>
                    <CardContent className="space-y-4 p-5">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={getMyStatusBadgeClasses(bid.myBidStatus)}
                            variant="outline"
                          >
                            {getMyStatusLabel(bid.myBidStatus)}
                          </Badge>
                          <Badge
                            className={getAuctionStatusBadgeClasses(bid.auctionStatus)}
                            variant="outline"
                          >
                            {getAuctionStatusLabel(bid.auctionStatus)}
                          </Badge>
                        </div>
                        <div>
                          <h2 className="text-lg leading-6 font-semibold">{bid.title}</h2>
                          <p className="text-muted-foreground text-sm">{bid.sellerName}</p>
                        </div>
                        <p className="text-muted-foreground text-sm leading-6">{bid.description}</p>
                      </div>

                      <Separator />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs tracking-wide uppercase">
                            My latest bid
                          </p>
                          <p className="font-medium">{formatCurrency(bid.myLatestBid)}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatDateTime(bid.lastBidAt)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs tracking-wide uppercase">
                            Current price
                          </p>
                          <p className="font-medium">{formatCurrency(bid.currentPrice)}</p>
                          <p className="text-muted-foreground text-xs">
                            Next valid bid {formatCurrency(nextValidBid)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs tracking-wide uppercase">
                            Auction result
                          </p>
                          <p className="text-sm">{getResultCopy(bid)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs tracking-wide uppercase">
                            Ends at
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock3 className="text-muted-foreground size-4" />
                            <span>{formatRelativeAuctionTime(bid.endsAt)}</span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {formatDateTime(bid.endsAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {isLive ? (
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/auctions/${bid.auctionId}`}>
                              Open auction
                              <ArrowUpRight className="size-4" />
                            </Link>
                          </Button>
                        ) : null}
                        <Button asChild size="sm">
                          <Link to={`/me/bids/${bid.auctionId}`}>View detail</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
