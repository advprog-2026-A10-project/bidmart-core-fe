import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
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
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Category Listings</h1>
          <p className="text-muted-foreground text-sm">
            Path: <span className="font-medium">{prettifyCategoryPath(categoryPath)}</span>
          </p>
        </header>

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
              <p className="text-destructive text-sm">Failed to load category listings.</p>
            </CardContent>
          </Card>
        ) : null}

        {!catalogQuery.isLoading &&
        !catalogQuery.isError &&
        catalogQuery.data?.data.length === 0 ? (
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalogQuery.data?.data.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base leading-tight">{listing.title}</CardTitle>
                    <p className="text-muted-foreground text-xs">Seller: {listing.sellerName}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{listing.status}</Badge>
                      <Badge variant="secondary">{listing.categoryName || "Uncategorized"}</Badge>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Current:</span>{" "}
                      <span className="font-semibold">{formatCurrency(listing.currentPrice)}</span>
                    </p>
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
