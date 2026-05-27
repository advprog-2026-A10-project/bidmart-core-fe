import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Ban, Gavel, Wallet } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

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
      toast.success("Listing cancelled successfully.");
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
  const canCancelListing =
    (listing.status === "Draft" || listing.status === "Active") && listing.bidCount === 0;
  const cancelBlockedReason =
    listing.status === "Cancelled"
      ? "Listing ini sudah dibatalkan sebelumnya."
      : listing.bidCount > 0
        ? "Listing yang sudah memiliki bid tidak bisa dibatalkan."
        : "Listing ini tidak bisa dibatalkan pada status saat ini.";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-destructive/25 from-destructive/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Cancel Listing</h1>
              <p className="text-muted-foreground text-sm">
                Cancelling removes the listing from active selling flow and cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={listing.status === "Cancelled" ? "destructive" : "outline"}>
                  {listing.status}
                </Badge>
                <Badge variant="secondary">{listing.categoryName || "Uncategorized"}</Badge>
              </div>
            </div>
            <Button asChild size="sm" type="button" variant="outline">
              <Link to={`/seller/listings/${listing.id}`}>Back to detail</Link>
            </Button>
          </div>
        </header>

        {cancelMutation.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-4">
              <p className="text-destructive text-sm">
                {getCatalogUiErrorMessage(cancelMutation.error, "Failed to cancel listing.")}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle className="text-base">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-6">
                {canCancelListing
                  ? "Pastikan Anda benar-benar ingin membatalkan listing ini. Setelah dibatalkan, listing tidak dapat dipublikasikan ulang."
                  : cancelBlockedReason}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Wallet className="size-3.5" />
                    Current price
                  </p>
                  <p className="font-semibold">{formatCurrency(listing.currentPrice)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Gavel className="size-3.5" />
                    Bid count
                  </p>
                  <p className="font-semibold">{listing.bidCount}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Ban className="size-3.5" />
                    Listing status
                  </p>
                  <p className="font-semibold">{listing.status}</p>
                </div>
              </div>

              {!canCancelListing ? (
                <p className="text-destructive border-destructive/30 bg-destructive/10 rounded-md border px-3 py-2 text-sm">
                  {cancelBlockedReason}
                </p>
              ) : (
                <p className="rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <AlertTriangle className="size-4" />
                    Konfirmasi diperlukan
                  </span>{" "}
                  Tindakan ini bersifat final untuk listing ini.
                </p>
              )}

              {cancelMutation.isSuccess ? (
                <p className="rounded-md border border-emerald-400/40 bg-emerald-100/40 px-3 py-2 text-sm text-emerald-900">
                  Listing cancelled successfully.
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button asChild type="button" variant="outline">
                  <Link to={`/seller/listings/${listing.id}`}>Back to detail</Link>
                </Button>
                <Button
                  disabled={!canCancelListing || cancelMutation.isPending || cancelMutation.isSuccess}
                  onClick={() => cancelMutation.mutate()}
                  variant="destructive"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Confirm cancel listing"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Listing ID:</span> {listing.id}
                </p>
                <p>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  {listing.categoryName || "Uncategorized"}
                </p>
                <p>
                  <span className="text-muted-foreground">Seller:</span> {listing.sellerName}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
