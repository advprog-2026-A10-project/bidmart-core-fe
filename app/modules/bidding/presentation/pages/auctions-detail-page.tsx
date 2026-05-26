import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  Eye,
  Gavel,
  Package2,
  ShieldCheck,
  Tag,
  TimerReset,
  Trophy,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

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
import { Separator } from "~/shared/components/ui/separator";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { Input } from "~/shared/components/ui/input";
import { getBiddingUseCases } from "~/modules/bidding/infrastructure";
import { BiddingApiMapper } from "~/modules/bidding/infrastructure/api/bidding-api.mapper";
import { auctionApiSchema } from "~/modules/bidding/infrastructure/api/schemas";
import type { Auction, AuctionStatus } from "~/modules/bidding/domain/entities/bidding";
import { startAuctionRealtimeSocket } from "../../infrastructure/realtime/auction-websocket";
import { BidForm } from "../components/bid-form";
import { CountdownTimer } from "../components/countdown-timer";

type BidFormValues = {
  amount: number;
  maxAmount?: number;
};

const AUCTION_DETAIL_QUERY_KEY = "auction-detail";
const AUCTION_PROXY_QUERY_KEY = "auction-proxy";

type StreamBidPlacedEvent = {
  auctionId: string;
  currentPrice: number;
  bidCount: number;
  minimumNextBid: number;
  highestBidderAlias: string | null;
  at: string;
};

type StreamAuctionExtendedEvent = {
  auctionId: string;
  endsAt: string;
  extensionCount: number;
  at: string;
};

type StreamFinalizedEvent = {
  auctionId: string;
  status: AuctionStatus;
  winnerId: string | null;
  winnerName: string | null;
  finalPrice: number;
  endedAt: string;
};

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

function truncateId(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractAuctionSnapshot(payload: unknown): Auction | null {
  const candidate =
    isRecord(payload) && isRecord(payload.auction) ? payload.auction : payload;
  const parsed = auctionApiSchema.safeParse(candidate);
  return parsed.success ? BiddingApiMapper.toAuction(parsed.data) : null;
}

function extractBidPlacedPayload(payload: unknown): StreamBidPlacedEvent | null {
  if (
    isRecord(payload) &&
    typeof payload.auctionId === "string" &&
    typeof payload.currentPrice === "number" &&
    typeof payload.bidCount === "number"
  ) {
    return payload as StreamBidPlacedEvent;
  }
  return null;
}

function extractAuctionExtendedPayload(payload: unknown): StreamAuctionExtendedEvent | null {
  if (
    isRecord(payload) &&
    typeof payload.auctionId === "string" &&
    typeof payload.endsAt === "string" &&
    typeof payload.extensionCount === "number"
  ) {
    return payload as StreamAuctionExtendedEvent;
  }
  return null;
}

function extractFinalizedPayload(payload: unknown): StreamFinalizedEvent | null {
  if (
    isRecord(payload) &&
    typeof payload.auctionId === "string" &&
    typeof payload.status === "string" &&
    (typeof payload.finalPrice === "number" || payload.finalPrice === null)
  ) {
    return payload as StreamFinalizedEvent;
  }
  return null;
}

function getEffectiveStatus(auction: Auction): AuctionStatus {
  if (auction.status === "ACTIVE" && auction.extensionCount > 0) {
    return "EXTENDED";
  }

  return auction.status;
}

function getStatusBadgeClasses(status: AuctionStatus) {
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

function getStatusLabel(status: AuctionStatus) {
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

function AuctionDetailSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="aspect-4/3 w-full rounded-xl" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/20 flex items-start justify-between gap-4 rounded-lg border p-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function AuctionsDetailPage() {
  const params = useParams();
  const auctionId = params.auctionId ?? "";
  const queryClient = useQueryClient();
  const [proxyMaxAmountDraft, setProxyMaxAmountDraft] = useState("");
  const [isProxyDraftDirty, setIsProxyDraftDirty] = useState(false);

  const useCases = getBiddingUseCases();

  const auctionQuery = useQuery({
    queryKey: [AUCTION_DETAIL_QUERY_KEY, auctionId],
    queryFn: () => useCases.getAuction.execute({ auctionId }),
    enabled: Boolean(auctionId),
  });

  const placeBidMutation = useMutation({
    mutationFn: ({ amount, maxAmount }: BidFormValues) =>
      useCases.placeBid.execute({ auctionId, amount, maxAmount }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: [AUCTION_DETAIL_QUERY_KEY, auctionId],
      });
      toast.success(
        result.autoBidApplied
          ? "Bid placed. Proxy auto-bid settlement has been applied."
          : result.extended
            ? "Bid placed. Auction extended by 2 minutes because the bid landed near closing time."
            : "Bid placed successfully.",
      );
    },
  });

  const proxyQuery = useQuery({
    queryKey: [AUCTION_PROXY_QUERY_KEY, auctionId],
    queryFn: () => useCases.getMyProxyBid.execute({ auctionId }),
    enabled: Boolean(auctionId),
  });

  const upsertProxyMutation = useMutation({
    mutationFn: ({ maxAmount }: { maxAmount: number }) =>
      useCases.upsertMyProxyBid.execute({ auctionId, maxAmount }),
    onSuccess: async (result) => {
      setProxyMaxAmountDraft(result.maxAmount ? String(result.maxAmount) : "");
      setIsProxyDraftDirty(false);
      await queryClient.invalidateQueries({
        queryKey: [AUCTION_PROXY_QUERY_KEY, auctionId],
      });
      toast.success("Proxy bidding has been updated.");
    },
  });

  const disableProxyMutation = useMutation({
    mutationFn: () => useCases.disableMyProxyBid.execute({ auctionId }),
    onSuccess: async (result) => {
      setProxyMaxAmountDraft("");
      setIsProxyDraftDirty(false);
      await queryClient.invalidateQueries({
        queryKey: [AUCTION_PROXY_QUERY_KEY, auctionId],
      });
      toast.success(
        result.disabled ? "Proxy bidding has been disabled." : "No active proxy bidding was found.",
      );
    },
  });

  useEffect(() => {
    if (!auctionId) {
      return;
    }

    return startAuctionRealtimeSocket({
      auctionId,
      onEvent: (event) => {
        if (event.type === "snapshot") {
          const snapshot = extractAuctionSnapshot(event.payload);
          if (!snapshot) {
            return;
          }

          const snapshotHasMyLatestBid =
            isRecord(event.payload) &&
            Object.prototype.hasOwnProperty.call(event.payload, "myLatestBid");
          queryClient.setQueryData<Auction>(
            [AUCTION_DETAIL_QUERY_KEY, auctionId],
            (current) => {
              if (snapshotHasMyLatestBid || !current) {
                return snapshot;
              }
              return { ...snapshot, myLatestBid: current.myLatestBid };
            },
          );
          return;
        }

        if (event.type === "bidPlaced") {
          const payload = extractBidPlacedPayload(event.payload);
          if (payload) {
            toast(`New leading bid: ${formatCurrency(payload.currentPrice)}`);
          }
          return;
        }

        if (event.type === "auctionExtended") {
          const payload = extractAuctionExtendedPayload(event.payload);
          if (payload) {
            toast(`Auction extended until ${formatDateTime(payload.endsAt)}`);
          }
          return;
        }

        if (event.type === "finalized") {
          const payload = extractFinalizedPayload(event.payload);
          if (!payload) {
            return;
          }

          if (payload.status === "WON") {
            toast.success("Auction finalized with a winning bid.");
          } else {
            toast("Auction finalized without a winner.");
          }
        }
      },
    });
  }, [auctionId, queryClient]);

  if (auctionQuery.isLoading) {
    return <AuctionDetailSkeleton />;
  }

  if (auctionQuery.isError || !auctionQuery.data) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Auction not available</CardTitle>
            <CardDescription>
              We could not load the requested auction right now. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  const auction = auctionQuery.data;
  const effectiveStatus = getEffectiveStatus(auction);
  const nextMinimumBid = auction.currentPrice + auction.bidIncrement;
  const isLeading = auction.myLatestBid !== null && auction.myLatestBid === auction.currentPrice;
  const reserveMet = auction.reservePrice !== null && auction.currentPrice >= auction.reservePrice;
  const minimumProxyAmount = proxyQuery.data?.minimumProxyAmount ?? nextMinimumBid;
  const proxyMaxAmountFromServer =
    proxyQuery.data?.enabled && proxyQuery.data.maxAmount ? String(proxyQuery.data.maxAmount) : "";
  const proxyMaxAmountInput = isProxyDraftDirty ? proxyMaxAmountDraft : proxyMaxAmountFromServer;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{auction.title}</h1>
              <p className="text-muted-foreground text-sm">
                Sold by {auction.sellerName} • English auction with real-time updates.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusBadgeClasses(effectiveStatus)} variant="outline">
                  {getStatusLabel(effectiveStatus)}
                </Badge>
                <Badge variant="secondary">{auction.bidCount} bids</Badge>
                <Badge variant="secondary">Listing {truncateId(auction.listingId)}</Badge>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to={`/auctions/${auction.id}/history`}>
                View bid history
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">English Auction</Badge>
                <Badge variant="outline">Auction {truncateId(auction.id)}</Badge>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl md:text-3xl">Live auction overview</CardTitle>
                <CardDescription className="max-w-3xl text-sm leading-6">
                  Real-time bidding with increment enforcement and anti-sniping extension.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-muted/20 overflow-hidden rounded-xl border">
                <div className="bg-muted aspect-4/3 w-full">
                  <img
                    alt={auction.title}
                    className="h-full w-full object-cover"
                    src={auction.imageUrl}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-muted/30 rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <Gavel className="size-4" />
                    Current highest bid
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(auction.currentPrice)}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Leading bidder: {auction.highestBidderAlias}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <Tag className="size-4" />
                    Next valid bid
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(nextMinimumBid)}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Increment minimum: {formatCurrency(auction.bidIncrement)}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <Clock3 className="size-4" />
                    Auction closes in
                  </div>
                  <p className="text-2xl font-semibold">
                    <CountdownTimer endsAt={auction.endsAt} />
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Ends at {formatDateTime(auction.endsAt)}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <Eye className="size-4" />
                    Auction activity
                  </div>
                  <p className="text-2xl font-semibold">{auction.bidCount} bids</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {auction.extensionCount > 0
                      ? `Extended ${auction.extensionCount}x by anti-sniping`
                      : "No anti-sniping extensions applied"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-muted-foreground text-sm leading-7">{auction.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auction details</CardTitle>
              <CardDescription>
                Fields below are aligned to the auction schema so this page is easier to connect to
                the backend later.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <DetailRow label="Auction status" value={getStatusLabel(effectiveStatus)} />
              <DetailRow label="Seller" value={auction.sellerName} />
              <DetailRow label="Start price" value={formatCurrency(auction.startPrice)} />
              <DetailRow label="Current price" value={formatCurrency(auction.currentPrice)} />
              <DetailRow
                label="Reserve price"
                value={auction.reservePrice ? formatCurrency(auction.reservePrice) : "No reserve"}
              />
              <DetailRow
                label="Reserve status"
                value={
                  auction.reservePrice === null
                    ? "No reserve configured"
                    : reserveMet
                      ? "Reserve met"
                      : "Reserve not met"
                }
              />
              <DetailRow label="Bid increment" value={formatCurrency(auction.bidIncrement)} />
              <DetailRow label="Bid count" value={`${auction.bidCount} bids`} />
              <DetailRow label="Starts at" value={formatDateTime(auction.startsAt)} />
              <DetailRow label="Current ends at" value={formatDateTime(auction.endsAt)} />
              <DetailRow label="Original ends at" value={formatDateTime(auction.originalEndsAt)} />
              <DetailRow label="Created at" value={formatDateTime(auction.createdAt)} />
              <DetailRow label="Extension count" value={`${auction.extensionCount}x`} />
              <DetailRow label="Winner" value={auction.winnerName ?? "Not decided yet"} />
              <DetailRow label="Listing ID" value={auction.listingId} />
              <DetailRow label="Auction ID" value={auction.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auction rules and behavior</CardTitle>
              <CardDescription>
                These sections explain the exact page behavior implemented for point 1.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <ShieldCheck className="text-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-foreground font-medium">English auction increment rule</p>
                  <p>
                    Every new bid must be at least the current highest price plus the configured
                    increment. The bid form is wired to validate that threshold before submission.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4">
                <TimerReset className="text-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-foreground font-medium">Anti-sniping extension</p>
                  <p>
                    If a bid lands within the last 2 minutes before the current end time, the page
                    extends the auction by 2 minutes and increases the extension counter.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Package2 className="text-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-foreground font-medium">Schema-ready auction fields</p>
                  <p>
                    Auction payload follows backend schema closely: image URL, reserve price,
                    status, original end time, and technical identifiers are available on the page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4">
                <UserRound className="text-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-foreground font-medium">Buyer-facing visibility</p>
                  <p>
                    The page shows buyer-relevant signals such as your last bid, current leader,
                    reserve status, and auction timeline while keeping bidder identity anonymized.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Place your bid</CardTitle>
              <CardDescription>
                {isLeading
                  ? "You are currently leading this auction."
                  : auction.myLatestBid
                    ? "Your latest bid has been outbid."
                    : "You have not placed a bid on this auction yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Your latest bid</span>
                  <span className="font-medium">
                    {auction.myLatestBid ? formatCurrency(auction.myLatestBid) : "—"}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Current highest</span>
                  <span className="font-medium">{formatCurrency(auction.currentPrice)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Reserve status</span>
                  <span className="font-medium">
                    {auction.reservePrice === null
                      ? "No reserve"
                      : reserveMet
                        ? "Reserve met"
                        : "Reserve not met"}
                  </span>
                </div>
              </div>

              <BidForm
                currentBid={auction.currentPrice}
                minIncrement={auction.bidIncrement}
                isSubmitting={placeBidMutation.isPending}
                onSubmit={async (values) => {
                  await placeBidMutation.mutateAsync({
                    amount: values.amount,
                    maxAmount: values.maxAmount,
                  });
                }}
              />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 border-t">
              <Button asChild variant="outline">
                <Link to={`/auctions/${auction.id}/history`}>
                  View bid history
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <p className="text-muted-foreground text-xs leading-5">
                Bid actions are submitted to backend auction endpoints and reflected after query
                refresh.
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proxy bidding</CardTitle>
              <CardDescription>
                Set maximum auto-bid so the system can react for you within your limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">
                    {proxyQuery.isLoading
                      ? "Loading..."
                      : proxyQuery.data?.enabled
                        ? "Enabled"
                        : "Disabled"}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Current proxy max</span>
                  <span className="font-medium">
                    {proxyQuery.data?.enabled && proxyQuery.data.maxAmount
                      ? formatCurrency(proxyQuery.data.maxAmount)
                      : "—"}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Minimum proxy max</span>
                  <span className="font-medium">{formatCurrency(minimumProxyAmount)}</span>
                </div>
              </div>

              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();

                  const parsed = Number(proxyMaxAmountInput);
                  if (!Number.isFinite(parsed) || parsed <= 0) {
                    toast.error("Proxy max must be a positive number.");
                    return;
                  }

                  if (parsed < minimumProxyAmount) {
                    toast.error(
                      `Proxy max must be at least ${formatCurrency(minimumProxyAmount)}.`,
                    );
                    return;
                  }

                  await upsertProxyMutation.mutateAsync({ maxAmount: parsed });
                }}
              >
                <label className="text-sm font-medium" htmlFor="proxy-max-amount">
                  Proxy max amount
                </label>
                <Input
                  id="proxy-max-amount"
                  min={minimumProxyAmount}
                  step={auction.bidIncrement}
                  type="number"
                  value={proxyMaxAmountInput}
                  onChange={(event) => {
                    setProxyMaxAmountDraft(event.target.value);
                    setIsProxyDraftDirty(true);
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={upsertProxyMutation.isPending || proxyQuery.isLoading}
                    type="submit"
                  >
                    {upsertProxyMutation.isPending ? "Saving..." : "Save proxy"}
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={disableProxyMutation.isPending || proxyQuery.isLoading}
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      await disableProxyMutation.mutateAsync();
                    }}
                  >
                    {disableProxyMutation.isPending ? "Disabling..." : "Disable proxy"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auction timeline</CardTitle>
              <CardDescription>Important timestamps and closing behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarClock className="size-4" />
                  Started at
                </span>
                <span className="text-right font-medium">{formatDateTime(auction.startsAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock3 className="size-4" />
                  Original end time
                </span>
                <span className="text-right font-medium">
                  {formatDateTime(auction.originalEndsAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <TimerReset className="size-4" />
                  Current end time
                </span>
                <span className="text-right font-medium">{formatDateTime(auction.endsAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Eye className="size-4" />
                  Extensions applied
                </span>
                <span className="font-medium">{auction.extensionCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Trophy className="size-4" />
                  Winner
                </span>
                <span className="font-medium">{auction.winnerName ?? "TBD"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </section>
  );
}
