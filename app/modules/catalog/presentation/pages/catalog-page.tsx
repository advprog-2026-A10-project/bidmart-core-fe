import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import { Skeleton } from "~/shared/components/ui/skeleton";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseNumberOrUndefined(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

function toDateTimeLocalValue(value: string): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const useCases = getCatalogUseCases();

  const query = searchParams.get("q") ?? "";
  const categoryIdRaw = searchParams.get("category_id") ?? "";
  const minRaw = searchParams.get("min") ?? "";
  const maxRaw = searchParams.get("max") ?? "";
  const endBefore = searchParams.get("endBefore") ?? "";
  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const pageSize = parsePositiveInt(
    searchParams.get("page_size") ?? searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );

  const parsedCategoryId = parseNumberOrUndefined(categoryIdRaw);
  const parsedMin = parseNumberOrUndefined(minRaw);
  const parsedMax = parseNumberOrUndefined(maxRaw);

  const catalogQuery = useQuery({
    queryKey: [
      CATALOG_QUERY_KEYS.browse,
      {
        query,
        categoryId: parsedCategoryId,
        min: parsedMin,
        max: parsedMax,
        endBefore,
        page,
        pageSize,
      },
    ],
    queryFn: () =>
      useCases.getCatalog.execute({
        q: query || undefined,
        categoryId: parsedCategoryId,
        min: parsedMin,
        max: parsedMax,
        endBefore: endBefore || undefined,
        page,
        pageSize,
      }),
  });

  const total = catalogQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function updatePage(nextPage: number) {
    const normalized = Math.min(Math.max(1, nextPage), totalPages);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(normalized));
    setSearchParams(next);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Catalog</h1>
          <p className="text-muted-foreground text-sm">
            Browse active listings with keyword, price range, and closing time filters.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const next = new URLSearchParams();
                const rawQ = String(formData.get("q") ?? "").trim();
                const rawCategoryId = String(formData.get("category_id") ?? "").trim();
                const rawMin = String(formData.get("min") ?? "").trim();
                const rawMax = String(formData.get("max") ?? "").trim();
                const rawEndBefore = String(formData.get("endBefore") ?? "").trim();

                if (rawQ) next.set("q", rawQ);
                if (rawCategoryId) next.set("category_id", rawCategoryId);
                if (rawMin) next.set("min", rawMin);
                if (rawMax) next.set("max", rawMax);
                if (rawEndBefore) {
                  const parsedDate = new Date(rawEndBefore);
                  if (!Number.isNaN(parsedDate.getTime())) {
                    next.set("endBefore", parsedDate.toISOString());
                  }
                }
                next.set("page", "1");
                next.set("page_size", String(pageSize));
                setSearchParams(next);
              }}
            >
              <Input defaultValue={query} name="q" placeholder="Keyword" />
              <Input defaultValue={categoryIdRaw} name="category_id" placeholder="Category ID" />
              <Input
                defaultValue={minRaw}
                min={0}
                name="min"
                placeholder="Min price"
                type="number"
              />
              <Input
                defaultValue={maxRaw}
                min={0}
                name="max"
                placeholder="Max price"
                type="number"
              />
              <Input
                defaultValue={toDateTimeLocalValue(endBefore)}
                name="endBefore"
                type="datetime-local"
              />
              <div className="col-span-full flex flex-wrap gap-2">
                <Button size="sm" type="submit" variant="default">
                  Apply filters
                </Button>
                <Button
                  onClick={() =>
                    setSearchParams(new URLSearchParams([["page_size", String(pageSize)]]))
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {catalogQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-3 py-6">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {catalogQuery.isError ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">
                Failed to load catalog data. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!catalogQuery.isLoading &&
        !catalogQuery.isError &&
        catalogQuery.data?.data.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No active listings matched the selected filters.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!catalogQuery.isLoading &&
        !catalogQuery.isError &&
        (catalogQuery.data?.data.length ?? 0) > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalogQuery.data?.data.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="space-y-3 py-6">
                    <div className="space-y-1">
                      <p className="text-lg leading-tight font-semibold">{listing.title}</p>
                      <p className="text-muted-foreground text-xs">Seller: {listing.sellerName}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{listing.status}</Badge>
                      {listing.categoryId ? (
                        <Badge variant="secondary">Category #{listing.categoryId}</Badge>
                      ) : (
                        <Badge variant="ghost">Uncategorized</Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Current:</span>{" "}
                        <span className="font-semibold">
                          {formatCurrency(listing.currentPrice)}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Bids:</span> {listing.bidCount}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Ends:</span>{" "}
                        {formatDateTime(listing.endsAt)}
                      </p>
                    </div>

                    <Button asChild className="w-full" size="sm">
                      <Link to={`/listings/${listing.id}`}>View detail</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

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
          </>
        ) : null}
      </div>
    </section>
  );
}
