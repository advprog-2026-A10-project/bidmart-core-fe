import { useQuery } from "@tanstack/react-query";
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

export default function BuyerListingsDetailPage() {
  const params = useParams();
  const useCases = getCatalogUseCases();
  const listingId = params.listingId ?? "";

  const listingQuery = useQuery({
    enabled: listingId.length > 0,
    queryKey: [CATALOG_QUERY_KEYS.publicDetail, listingId],
    queryFn: () =>
      useCases.getPublicListing.execute({
        listingId,
      }),
  });

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Listing Detail</h1>
            <p className="text-muted-foreground text-sm">Listing ID: {listingId}</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/catalog">Back to catalog</Link>
          </Button>
        </div>

        {listingQuery.isLoading ? (
          <Card>
            <CardContent className="space-y-4 py-6">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-52 w-full" />
            </CardContent>
          </Card>
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
              <Card>
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{listingQuery.data.listing.status}</Badge>
                    <Badge variant="secondary">
                      {listingQuery.data.listing.categoryName || "Uncategorized"}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{listingQuery.data.listing.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Sold by{" "}
                    <span className="font-medium">{listingQuery.data.listing.sellerName}</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6">{listingQuery.data.listing.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  {listingQuery.data.images.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No images provided for this listing.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {listingQuery.data.images.map((image) => (
                        <div className="overflow-hidden rounded-md border" key={image.id}>
                          <img
                            alt={listingQuery.data?.listing.title}
                            className="h-56 w-full object-cover"
                            loading="lazy"
                            src={image.url}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </main>

            <aside className="space-y-4 lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Auction Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Current price:</span>{" "}
                    <span className="font-semibold">
                      {formatCurrency(listingQuery.data.listing.currentPrice)}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Starting price:</span>{" "}
                    {formatCurrency(listingQuery.data.listing.startPrice)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Reserve price:</span>{" "}
                    {listingQuery.data.listing.reservePrice
                      ? formatCurrency(listingQuery.data.listing.reservePrice)
                      : "None"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Min increment:</span>{" "}
                    {formatCurrency(listingQuery.data.listing.minIncrement)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Bid count:</span>{" "}
                    {listingQuery.data.listing.bidCount}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Starts:</span>{" "}
                    {formatDateTime(listingQuery.data.listing.startsAt)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Ends:</span>{" "}
                    {formatDateTime(listingQuery.data.listing.endsAt)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Updated:</span>{" "}
                    {formatDateTime(listingQuery.data.listing.updatedAt)}
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
