import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">My Listings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your listings and publish draft items when they are ready.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/seller/listings/new">Create listing</Link>
          </Button>
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
          <CardContent className="px-0 pb-0">
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
                {listingsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="space-y-2 px-6 py-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-2/3" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {listingsQuery.isError ? (
                  <TableRow>
                    <TableCell className="text-destructive text-sm" colSpan={6}>
                      {loadErrorMessage}
                    </TableCell>
                  </TableRow>
                ) : null}

                {!listingsQuery.isLoading &&
                !listingsQuery.isError &&
                listingsQuery.data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground text-sm" colSpan={6}>
                      You have no listings yet.
                    </TableCell>
                  </TableRow>
                ) : null}

                {listingsQuery.data?.data.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {listing.categoryName || "Uncategorized"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={listing.status === "Draft" ? "secondary" : "outline"}>
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
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/seller/listings/${listing.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/seller/listings/${listing.id}/cancel`}>Cancel</Link>
                        </Button>
                        {listing.status === "Draft" ? (
                          <Button
                            disabled={publishMutation.isPending}
                            onClick={() => publishMutation.mutate(listing.id)}
                            size="sm"
                          >
                            {publishMutation.isPending ? "Publishing..." : "Publish"}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-md border px-4 py-3">
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
