import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ChevronLeft, Filter, Gavel, Tags } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent } from "~/shared/components/ui/card";
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function prettifyCategoryPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join(" / ");
}

function buildListingImageUrl(title: string, categoryName: string): string {
  const text = encodeURIComponent(`${categoryName || "Catalog"} - ${title}`);
  return `https://placehold.co/1200x900/png?text=${text}`;
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
  const absMinutes = Math.round(Math.abs(diffMs) / 60_000);

  if (absMinutes < 60) {
    return diffMs >= 0 ? `${absMinutes}m left` : `${absMinutes}m ago`;
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 48) {
    return diffMs >= 0 ? `${absHours}h left` : `${absHours}h ago`;
  }

  const absDays = Math.round(absHours / 24);
  return diffMs >= 0 ? `${absDays}d left` : `${absDays}d ago`;
}

export default function CategoryFilteringPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const useCases = getCatalogUseCases();
  const categoryPath = params["*"] ?? "";

  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const pageSize = parsePositiveInt(
    searchParams.get("page_size") ?? searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );

  const catalogQuery = useQuery({
    enabled: categoryPath.length > 0,
    queryKey: [CATALOG_QUERY_KEYS.categoryPath, { categoryPath, page, pageSize }],
    queryFn: () =>
      useCases.browseCategoryPathCatalog.execute({
        categoryPath,
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

  if (!categoryPath) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">Invalid category path.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-5">
        <header className="border-primary/15 from-primary/10 via-background to-background relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Category Listings</h1>
              <p className="text-muted-foreground text-sm">
                Path: <span className="font-medium">{prettifyCategoryPath(categoryPath)}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="gap-1.5 px-2.5 py-1 text-xs" variant="secondary">
                  <Tags className="size-3.5" />
                  {total} items
                </Badge>
                <Badge className="gap-1.5 px-2.5 py-1 text-xs" variant="secondary">
                  <Filter className="size-3.5" />
                  Category scope
                </Badge>
              </div>
            </div>

            <Button asChild size="sm" variant="outline">
              <Link to="/catalog">
                <ChevronLeft className="size-4" />
                Back to catalog
              </Link>
            </Button>
          </div>
          <div className="bg-primary/20 pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl" />
        </header>

        {catalogQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <CardContent className="space-y-3 py-4">
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
              <p className="text-destructive text-sm">Failed to load category listings.</p>
            </CardContent>
          </Card>
        ) : null}

        {!catalogQuery.isLoading && !catalogQuery.isError && catalogQuery.data?.data.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No active listings available for this category path.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!catalogQuery.isLoading &&
        !catalogQuery.isError &&
        (catalogQuery.data?.data.length ?? 0) > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catalogQuery.data?.data.map((listing) => (
                <Card
                  className="group border-border/80 hover:border-primary/30 overflow-hidden pt-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  key={listing.id}
                >
                  <div className="bg-muted relative aspect-[4/3] overflow-hidden">
                    <img
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      src={buildListingImageUrl(listing.title, listing.categoryName)}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3">
                      <p className="truncate text-sm font-semibold text-white">{listing.title}</p>
                      <p className="truncate text-xs text-white/85">Seller: {listing.sellerName}</p>
                    </div>
                  </div>

                  <CardContent className="space-y-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="font-semibold" variant="outline">
                        {listing.status}
                      </Badge>
                      <Badge variant="secondary">{listing.categoryName || "Uncategorized"}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Current price</p>
                        <p className="font-semibold">{formatCurrency(listing.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Bids</p>
                        <p className="inline-flex items-center gap-1 font-semibold">
                          <Gavel className="size-3.5" />
                          {listing.bidCount}
                        </p>
                      </div>
                    </div>

                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p className="inline-flex items-center gap-1.5">
                        <CalendarClock className="size-3.5" />
                        Ends: {formatDateTime(listing.endsAt)}
                      </p>
                      <p className="text-foreground font-medium">{formatRemainingTime(listing.endsAt)}</p>
                    </div>

                    <Button asChild className="w-full" size="sm">
                      <Link to={`/listings/${listing.id}`}>View detail</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
