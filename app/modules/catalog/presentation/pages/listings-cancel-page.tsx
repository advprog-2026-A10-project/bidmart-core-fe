import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { getCatalogUiErrorMessage } from "~/modules/catalog/presentation/error-message";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
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

export default function ListingsCancelPage() {
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

  const cancelMutation = useMutation({
    mutationFn: () =>
      useCases.cancelListing.execute({
        listingId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [CATALOG_QUERY_KEYS.sellerList] }),
        queryClient.invalidateQueries({ queryKey: [CATALOG_QUERY_KEYS.sellerDetail, listingId] }),
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
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-56 w-full" />
        </div>
      </section>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Unable to cancel listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-destructive text-sm">
              {getCatalogUiErrorMessage(detailQuery.error, "Failed to load listing data.")}
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

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Cancel Listing</h1>
          <p className="text-muted-foreground text-sm">
            This action should only be used if the listing has not received bids.
          </p>
        </header>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base">{listing.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Status:</span> {listing.status}
            </p>
            <p>
              <span className="text-muted-foreground">Current price:</span>{" "}
              {formatCurrency(listing.currentPrice)}
            </p>
            <p>
              <span className="text-muted-foreground">Bid count:</span> {listing.bidCount}
            </p>

            {cancelMutation.isSuccess ? (
              <p className="rounded-md border border-emerald-400/40 bg-emerald-100/40 px-3 py-2 text-sm text-emerald-900">
                Listing cancelled successfully.
              </p>
            ) : null}

            {cancelMutation.isError ? (
              <p className="text-destructive border-destructive/30 bg-destructive/10 rounded-md border px-3 py-2 text-sm">
                {getCatalogUiErrorMessage(cancelMutation.error, "Failed to cancel listing.")}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button asChild type="button" variant="outline">
                <Link to={`/seller/listings/${listing.id}`}>Back to detail</Link>
              </Button>
              <Button
                disabled={cancelMutation.isPending || cancelMutation.isSuccess}
                onClick={() => cancelMutation.mutate()}
                variant="destructive"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Confirm cancel listing"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
