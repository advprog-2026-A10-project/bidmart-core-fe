import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { getCatalogUiErrorMessage } from "~/modules/catalog/presentation/error-message";
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

export default function ListingsDetailPage() {
  const { listingId = "" } = useParams();
  const useCases = getCatalogUseCases();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    enabled: Boolean(listingId),
    queryKey: [CATALOG_QUERY_KEYS.sellerDetail, listingId],
    queryFn: () =>
      useCases.getMyListing.execute({
        listingId,
      }),
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      useCases.publishListing.execute({
        listingId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [CATALOG_QUERY_KEYS.sellerDetail, listingId] }),
        queryClient.invalidateQueries({ queryKey: [CATALOG_QUERY_KEYS.sellerList] }),
      ]);
    },
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

  if (detailQuery.isLoading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      </section>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Listing unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-destructive text-sm">
              {getCatalogUiErrorMessage(detailQuery.error, "Failed to load listing detail.")}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/seller/listings">Back to listings</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const listing = detailQuery.data.listing;
  const images = detailQuery.data.images;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Seller Listing Detail</h1>
            <p className="text-muted-foreground text-sm">Listing ID: {listing.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/seller/listings">Back</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/seller/listings/${listing.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/seller/listings/${listing.id}/cancel`}>Cancel</Link>
            </Button>
            {listing.status === "Draft" ? (
              <Button
                disabled={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
                size="sm"
              >
                {publishMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
            ) : null}
          </div>
        </div>

        {publishMutation.isError ? (
          <Card className="border-destructive/30">
            <CardContent className="py-3">
              <p className="text-destructive text-sm">
                {getCatalogUiErrorMessage(publishMutation.error, "Failed to publish listing.")}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-12">
          <main className="space-y-6 lg:col-span-8">
            <Card>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={listing.status === "Draft" ? "secondary" : "outline"}>
                    {listing.status}
                  </Badge>
                  <Badge variant="secondary">{listing.categoryName || "Uncategorized"}</Badge>
                </div>
                <CardTitle className="text-2xl">{listing.title}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Seller: <span className="font-medium">{listing.sellerName}</span>
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6">{listing.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Images</CardTitle>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No images attached.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {images.map((image) => (
                      <div className="overflow-hidden rounded-md border" key={image.id}>
                        <img
                          alt={listing.title}
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
                <CardTitle className="text-base">Auction Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Start price:</span>{" "}
                  {formatCurrency(listing.startPrice)}
                </p>
                <p>
                  <span className="text-muted-foreground">Current price:</span>{" "}
                  <span className="font-semibold">{formatCurrency(listing.currentPrice)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Reserve price:</span>{" "}
                  {listing.reservePrice ? formatCurrency(listing.reservePrice) : "None"}
                </p>
                <p>
                  <span className="text-muted-foreground">Min increment:</span>{" "}
                  {formatCurrency(listing.minIncrement)}
                </p>
                <p>
                  <span className="text-muted-foreground">Bid count:</span> {listing.bidCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Starts at:</span>{" "}
                  {formatDateTime(listing.startsAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">Ends at:</span>{" "}
                  {formatDateTime(listing.endsAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">Updated at:</span>{" "}
                  {formatDateTime(listing.updatedAt)}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
