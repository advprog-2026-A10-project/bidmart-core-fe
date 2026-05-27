import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Gavel,
  Image as ImageIcon,
  Store,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Skeleton } from "~/shared/components/ui/skeleton";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRemainingTime(value: string): string {
  const endsAt = new Date(value).getTime();
  if (Number.isNaN(endsAt)) {
    return "Unknown";
  }

  const diffMs = endsAt - Date.now();
  if (diffMs <= 0) {
    return "Auction ended";
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes left`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 48) {
    return `${totalHours} hours left`;
  }

  const totalDays = Math.floor(totalHours / 24);
  return `${totalDays} days left`;
}

function isAuctionLive(params: {
  auctionId: string | null;
  status: string;
  startsAt: string;
  endsAt: string;
}): boolean {
  if (!params.auctionId || params.status !== "Active") {
    return false;
  }

  const startsAtMs = Date.parse(params.startsAt);
  const endsAtMs = Date.parse(params.endsAt);
  if (Number.isNaN(startsAtMs) || Number.isNaN(endsAtMs)) {
    return false;
  }

  const nowMs = Date.now();
  return nowMs >= startsAtMs && nowMs < endsAtMs;
}

export default function BuyerListingsDetailPage() {
  const params = useParams();
  const useCases = getCatalogUseCases();
  const listingId = params.listingId ?? "";
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const listingQuery = useQuery({
    enabled: listingId.length > 0,
    queryKey: [CATALOG_QUERY_KEYS.publicDetail, listingId],
    queryFn: () =>
      useCases.getPublicListing.execute({
        listingId,
      }),
  });

  const activeImage = useMemo(() => {
    const images = listingQuery.data?.images ?? [];
    const clampedIndex = activeImageIndex >= images.length ? 0 : activeImageIndex;
    return images[clampedIndex] ?? null;
  }, [activeImageIndex, listingQuery.data?.images]);

  const canGoToLiveAuction = listingQuery.data
    ? isAuctionLive({
        auctionId: listingQuery.data.listing.auctionId,
        status: listingQuery.data.listing.status,
        startsAt: listingQuery.data.listing.startsAt,
        endsAt: listingQuery.data.listing.endsAt,
      })
    : false;

  if (!listingId) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">Invalid listing ID.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <div className="border-primary/15 from-primary/10 via-background to-background flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-gradient-to-r p-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Listing Detail</h1>
            <p className="text-muted-foreground text-sm">Listing ID: {listingId}</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/catalog">
              <ArrowLeft className="size-4" />
              Back to catalog
            </Link>
          </Button>
        </div>

        {listingQuery.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <Card className="overflow-hidden pt-0">
                <Skeleton className="h-[380px] w-full rounded-none" />
                <CardContent className="space-y-3 py-4">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4 lg:col-span-4">
              <Card>
                <CardContent className="space-y-3 py-6">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {listingQuery.isError ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">
                Failed to load listing detail. The item may be unavailable.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!listingQuery.isLoading && !listingQuery.isError && listingQuery.data ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <main className="space-y-6 lg:col-span-8">
              <Card className="overflow-hidden pt-0">
                {activeImage ? (
                  <div className="bg-muted relative aspect-[16/10] overflow-hidden">
                    <img
                      alt={listingQuery.data.listing.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={activeImage.url}
                    />
                  </div>
                ) : (
                  <div className="bg-muted flex aspect-[16/10] items-center justify-center">
                    <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
                      <ImageIcon className="size-6" />
                      No image preview
                    </div>
                  </div>
                )}

                <CardContent className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{listingQuery.data.listing.status}</Badge>
                      <Badge variant="secondary">
                        {listingQuery.data.listing.categoryName || "Uncategorized"}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                      {listingQuery.data.listing.title}
                    </h2>
                    <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                      <Store className="size-4" />
                      Sold by {listingQuery.data.listing.sellerName}
                    </p>
                  </div>

                  {listingQuery.data.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {listingQuery.data.images.map((image, index) => (
                        <button
                          className={`overflow-hidden rounded-md border transition-all ${
                            index === activeImageIndex
                              ? "border-primary ring-primary/30 ring-2"
                              : "border-border hover:border-primary/40"
                          }`}
                          key={image.id}
                          onClick={() => setActiveImageIndex(index)}
                          type="button"
                        >
                          <img
                            alt={`${listingQuery.data?.listing.title} thumbnail ${index + 1}`}
                            className="h-18 w-full object-cover"
                            loading="lazy"
                            src={image.url}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No images provided for this listing.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About this item</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7">{listingQuery.data.listing.description}</p>
                </CardContent>
              </Card>
            </main>

            <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Auction Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground text-xs">Current price</p>
                    <p className="text-xl font-bold">{formatCurrency(listingQuery.data.listing.currentPrice)}</p>
                    <p className="text-muted-foreground mt-1 inline-flex items-center gap-1 text-xs">
                      <TrendingUp className="size-3.5" />
                      {formatRemainingTime(listingQuery.data.listing.endsAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">Starting price</p>
                      <p className="font-semibold">{formatCurrency(listingQuery.data.listing.startPrice)}</p>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">Min increment</p>
                      <p className="font-semibold">{formatCurrency(listingQuery.data.listing.minIncrement)}</p>
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground text-xs inline-flex items-center gap-1">
                      <Gavel className="size-3.5" />
                      Bid count
                    </p>
                    <p className="font-semibold">{listingQuery.data.listing.bidCount} bids</p>
                  </div>

                  {listingQuery.data.listing.auctionId ? (
                    canGoToLiveAuction ? (
                      <Button asChild className="w-full" size="sm">
                        <Link to={`/auctions/${listingQuery.data.listing.auctionId}`}>
                          Go to live auction
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full" disabled size="sm">
                        Go to live auction
                      </Button>
                    )
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="inline-flex items-center gap-2">
                    <Clock3 className="text-muted-foreground size-4" />
                    <span>
                      <span className="text-muted-foreground">Starts:</span>{" "}
                      {formatDateTime(listingQuery.data.listing.startsAt)}
                    </span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarClock className="text-muted-foreground size-4" />
                    <span>
                      <span className="text-muted-foreground">Ends:</span>{" "}
                      {formatDateTime(listingQuery.data.listing.endsAt)}
                    </span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarClock className="text-muted-foreground size-4" />
                    <span>
                      <span className="text-muted-foreground">Updated:</span>{" "}
                      {formatDateTime(listingQuery.data.listing.updatedAt)}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
