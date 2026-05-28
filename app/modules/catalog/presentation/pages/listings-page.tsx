import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Gavel, PlusSquare, Tag } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { getCatalogUiErrorMessage } from "~/modules/catalog/presentation/error-message";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

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

function getStatusBadgeClassName(status: string): string {
  switch (status) {
    case "Draft":
      return "border-slate-300 bg-slate-100 text-slate-800";
    case "Active":
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
    case "Cancelled":
      return "border-red-300 bg-red-100 text-red-800";
    case "Sold":
      return "border-blue-300 bg-blue-100 text-blue-800";
    case "Expired":
      return "border-amber-300 bg-amber-100 text-amber-900";
    default:
      return "border-zinc-300 bg-zinc-100 text-zinc-800";
  }
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const useCases = getCatalogUseCases();
  const queryClient = useQueryClient();

  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const pageSize = parsePositiveInt(
    searchParams.get("page_size") ?? searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );

  const listingsQuery = useQuery({
    queryKey: [CATALOG_QUERY_KEYS.sellerList, { page, pageSize }],
    queryFn: () =>
      useCases.listMyListings.execute({
        page,
        pageSize,
      }),
  });

  const publishMutation = useMutation({
    mutationFn: (listingId: string) =>
      useCases.publishListing.execute({
        listingId,
      }),
    onSuccess: async (_, listingId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [CATALOG_QUERY_KEYS.sellerList],
        }),
        queryClient.invalidateQueries({
          queryKey: [CATALOG_QUERY_KEYS.sellerDetail, listingId],
        }),
      ]);
    },
  });

  const total = listingsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const listings = listingsQuery.data?.data ?? [];
  const draftCount = listings.filter((item) => item.status === "Draft").length;
  const activeCount = listings.filter((item) => item.status === "Active").length;
  const totalBidsOnPage = listings.reduce((sum, item) => sum + item.bidCount, 0);
  const publishingListingId = publishMutation.isPending ? publishMutation.variables : null;

  const loadErrorMessage = getCatalogUiErrorMessage(
    listingsQuery.error,
    "Failed to load seller listings.",
  );
  const publishErrorMessage = getCatalogUiErrorMessage(
    publishMutation.error,
    "Failed to publish listing.",
  );

  function updatePage(nextPage: number) {
    const normalized = Math.min(Math.max(1, nextPage), totalPages);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(normalized));
    next.set("page_size", String(pageSize));
    setSearchParams(next);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
              <p className="text-muted-foreground text-sm">
                Manage your listings and publish draft items when they are ready.
              </p>
            </div>
            <Button asChild className="w-full md:w-auto" size="sm">
              <Link to="/seller/listings/new">
                <PlusSquare className="size-4" />
                Create listing
              </Link>
            </Button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border bg-white/70 p-3 backdrop-blur">
              <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <Tag className="size-3.5" />
                Draft (this page)
              </p>
              <p className="text-base font-semibold">{draftCount}</p>
            </div>
            <div className="rounded-lg border bg-white/70 p-3 backdrop-blur">
              <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <Clock3 className="size-3.5" />
                Active (this page)
              </p>
              <p className="text-base font-semibold">{activeCount}</p>
            </div>
            <div className="rounded-lg border bg-white/70 p-3 backdrop-blur">
              <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <Gavel className="size-3.5" />
                Total bids (this page)
              </p>
              <p className="text-base font-semibold">{totalBidsOnPage}</p>
            </div>
          </div>
        </header>

        {publishMutation.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-4">
              <p className="text-destructive text-sm">{publishErrorMessage}</p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seller Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {listingsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : null}

            {listingsQuery.isError ? (
              <p className="text-destructive rounded-md border border-red-300/50 bg-red-50 px-3 py-2 text-sm">
                {loadErrorMessage}
              </p>
            ) : null}

            {!listingsQuery.isLoading && !listingsQuery.isError && listings.length === 0 ? (
              <p className="text-muted-foreground rounded-md border border-dashed px-3 py-4 text-sm">
                You have no listings yet. Create your first listing to start selling.
              </p>
            ) : null}

            {!listingsQuery.isLoading && !listingsQuery.isError && listings.length > 0 ? (
              <>
                <div className="grid gap-3 md:hidden">
                  {listings.map((listing) => {
                    const canModifyListing =
                      (listing.status === "Draft" || listing.status === "Active") &&
                      listing.bidCount === 0;
                    return (
                    <article className="rounded-lg border p-3" key={listing.id}>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold leading-5">{listing.title}</p>
                            <p className="text-muted-foreground text-xs">
                              {listing.categoryName || "Uncategorized"}
                            </p>
                          </div>
                          <Badge className={getStatusBadgeClassName(listing.status)} variant="outline">
                            {listing.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
                          <p>Current: {formatCurrency(listing.currentPrice)}</p>
                          <p>Bids: {listing.bidCount}</p>
                          <p className="col-span-2">Ends: {formatDateTime(listing.endsAt)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/seller/listings/${listing.id}`}>Detail</Link>
                          </Button>
                          {canModifyListing ? (
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/seller/listings/${listing.id}/edit`}>Edit</Link>
                            </Button>
                          ) : null}
                          {canModifyListing ? (
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/seller/listings/${listing.id}/cancel`}>Cancel</Link>
                            </Button>
                          ) : null}
                          {listing.status === "Draft" ? (
                            <Button
                              disabled={publishMutation.isPending}
                              onClick={() => publishMutation.mutate(listing.id)}
                              size="sm"
                            >
                              {publishingListingId === listing.id ? "Publishing..." : "Publish"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Bids</TableHead>
                        <TableHead>Ends At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => {
                        const canModifyListing =
                          (listing.status === "Draft" || listing.status === "Active") &&
                          listing.bidCount === 0;
                        return (
                          <TableRow className="hover:bg-muted/30" key={listing.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{listing.title}</p>
                                <p className="text-muted-foreground text-xs">
                                  {listing.categoryName || "Uncategorized"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeClassName(listing.status)}
                                variant="outline"
                              >
                                {listing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(listing.currentPrice)}</TableCell>
                            <TableCell>{listing.bidCount}</TableCell>
                            <TableCell className="text-xs">{formatDateTime(listing.endsAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/seller/listings/${listing.id}`}>Detail</Link>
                                </Button>
                                {canModifyListing ? (
                                  <Button asChild size="sm" variant="outline">
                                    <Link to={`/seller/listings/${listing.id}/edit`}>Edit</Link>
                                  </Button>
                                ) : null}
                                {canModifyListing ? (
                                  <Button asChild size="sm" variant="outline">
                                    <Link to={`/seller/listings/${listing.id}/cancel`}>Cancel</Link>
                                  </Button>
                                ) : null}
                                {listing.status === "Draft" ? (
                                  <Button
                                    disabled={publishMutation.isPending}
                                    onClick={() => publishMutation.mutate(listing.id)}
                                    size="sm"
                                  >
                                    {publishingListingId === listing.id ? "Publishing..." : "Publish"}
                                  </Button>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3">
          <p className="text-muted-foreground text-sm">
            Page {page} of {totalPages} ({total} items)
          </p>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => updatePage(page - 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => updatePage(page + 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
