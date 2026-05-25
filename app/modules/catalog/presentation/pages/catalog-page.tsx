import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Filter, Gavel, Search, Tags } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components/ui/select";
import { Skeleton } from "~/shared/components/ui/skeleton";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const PRICE_MIN_BOUND = 0;
const PRICE_STEP = 50_000;

type DeadlinePreset = "any" | "24h" | "3d" | "7d" | "custom";

type FilterDraft = {
  q: string;
  categoryId: string;
  minPriceInput: string;
  maxPriceInput: string;
  deadlinePreset: DeadlinePreset;
  customEndBefore: string;
};

type CategoryOption = {
  id: number;
  label: string;
  slugPath: string;
  depth: number;
};

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

function clampPrice(value: number): number {
  return Math.max(PRICE_MIN_BOUND, Math.round(value / PRICE_STEP) * PRICE_STEP);
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

function buildListingImageUrl(title: string, categoryName: string): string {
  const text = encodeURIComponent(`${categoryName || "Catalog"} - ${title}`);
  return `https://placehold.co/1200x900/png?text=${text}`;
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

function inferDeadlinePreset(endBefore: string): DeadlinePreset {
  if (!endBefore) {
    return "any";
  }

  const target = new Date(endBefore).getTime();
  if (Number.isNaN(target)) {
    return "any";
  }

  const diffHours = (target - Date.now()) / 3_600_000;
  const tolerance = 0.4;

  if (Math.abs(diffHours - 24) <= tolerance) return "24h";
  if (Math.abs(diffHours - 72) <= tolerance) return "3d";
  if (Math.abs(diffHours - 168) <= tolerance) return "7d";
  return "custom";
}

function addHours(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

function resolveEndBeforeValue(
  preset: DeadlinePreset,
  customEndBefore: string,
): string | undefined {
  if (preset === "any") {
    return undefined;
  }
  if (preset === "24h") {
    return addHours(24);
  }
  if (preset === "3d") {
    return addHours(72);
  }
  if (preset === "7d") {
    return addHours(168);
  }

  const parsedDate = new Date(customEndBefore);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function buildDraftFromSearch(searchParams: URLSearchParams): FilterDraft {
  const query = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("category_id") ?? "";
  const minRaw = parseNumberOrUndefined(searchParams.get("min"));
  const maxRaw = parseNumberOrUndefined(searchParams.get("max"));
  const endBefore = searchParams.get("endBefore") ?? "";

  let minPriceInput = minRaw == null ? "" : String(clampPrice(minRaw));
  let maxPriceInput = maxRaw == null ? "" : String(clampPrice(maxRaw));

  const parsedMin = parseNumberOrUndefined(minPriceInput);
  const parsedMax = parseNumberOrUndefined(maxPriceInput);
  if (parsedMin != null && parsedMax != null && parsedMin > parsedMax) {
    minPriceInput = String(parsedMax);
    maxPriceInput = String(parsedMin);
  }

  const deadlinePreset = inferDeadlinePreset(endBefore);

  return {
    q: query,
    categoryId,
    minPriceInput,
    maxPriceInput,
    deadlinePreset,
    customEndBefore: deadlinePreset === "custom" ? toDateTimeLocalValue(endBefore) : "",
  };
}

async function loadCategoryOptions(
  listCategories: (params?: {
    parentId?: number;
  }) => Promise<Array<{ id: number; name: string; slug: string; childCount: number }>>,
): Promise<CategoryOption[]> {
  const visited = new Set<number>();

  const walk = async (
    parentId: number | undefined,
    ancestors: string[],
    slugAncestors: string[],
  ): Promise<CategoryOption[]> => {
    const categories = await listCategories(parentId == null ? {} : { parentId });
    const options: CategoryOption[] = [];

    for (const category of categories) {
      if (visited.has(category.id)) {
        continue;
      }
      visited.add(category.id);

      const path = [...ancestors, category.name];
      const slugPath = [...slugAncestors, category.slug].join("/");
      options.push({
        id: category.id,
        label: path.join(" / "),
        slugPath,
        depth: ancestors.length,
      });

      if (category.childCount > 0) {
        const children = await walk(category.id, path, [...slugAncestors, category.slug]);
        options.push(...children);
      }
    }

    return options;
  };

  return walk(undefined, [], []);
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

  const [draft, setDraft] = useState<FilterDraft>(() => buildDraftFromSearch(searchParams));

  useEffect(() => {
    setDraft(buildDraftFromSearch(searchParams));
  }, [searchParams]);

  const categoriesQuery = useQuery({
    queryKey: [CATALOG_QUERY_KEYS.categories],
    queryFn: () => loadCategoryOptions((params) => useCases.listCategories.execute(params ?? {})),
    staleTime: 300_000,
  });

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
  const activeFilterCount = [
    query.length > 0,
    categoryIdRaw.length > 0,
    minRaw.length > 0,
    maxRaw.length > 0,
    endBefore.length > 0,
  ].filter(Boolean).length;

  const deadlinePreview = useMemo(() => {
    const endBeforeValue = resolveEndBeforeValue(draft.deadlinePreset, draft.customEndBefore);
    return endBeforeValue ? formatDateTime(endBeforeValue) : null;
  }, [draft.customEndBefore, draft.deadlinePreset]);

  const draftMinPrice = parseNumberOrUndefined(draft.minPriceInput || null);
  const draftMaxPrice = parseNumberOrUndefined(draft.maxPriceInput || null);
  const categoryPathById = useMemo(() => {
    const map = new Map<number, string>();
    for (const option of categoriesQuery.data ?? []) {
      map.set(option.id, option.slugPath);
    }
    return map;
  }, [categoriesQuery.data]);
  const selectedCategoryPath =
    draft.categoryId.trim().length > 0
      ? categoryPathById.get(Number(draft.categoryId)) ?? null
      : null;
  const quickBrowseCategories = (categoriesQuery.data ?? []).filter((category) => category.depth <= 1).slice(0, 10);

  function updatePage(nextPage: number) {
    const normalized = Math.min(Math.max(1, nextPage), totalPages);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(normalized));
    setSearchParams(next);
  }

  function applyFilters() {
    const next = new URLSearchParams();
    const cleanedQuery = draft.q.trim();

    if (cleanedQuery) {
      next.set("q", cleanedQuery);
    }

    if (draft.categoryId.trim()) {
      next.set("category_id", draft.categoryId.trim());
    }

    if (draftMinPrice != null && draftMinPrice > PRICE_MIN_BOUND) {
      next.set("min", String(clampPrice(draftMinPrice)));
    }

    if (draftMaxPrice != null) {
      next.set("max", String(clampPrice(draftMaxPrice)));
    }

    const endBeforeValue = resolveEndBeforeValue(draft.deadlinePreset, draft.customEndBefore);
    if (endBeforeValue) {
      next.set("endBefore", endBeforeValue);
    }

    next.set("page", "1");
    next.set("page_size", String(pageSize));
    setSearchParams(next);
  }

  function resetFilters() {
    const next = new URLSearchParams([["page_size", String(pageSize)]]);
    setSearchParams(next);
    setDraft(buildDraftFromSearch(next));
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-5">
        <header className="border-primary/15 from-primary/10 via-background to-background relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6">
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">BidMart Catalog</h1>
              <p className="text-muted-foreground text-sm">
                Discover live auction listings with smart filters and up-to-date bidding insights.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1.5 px-2.5 py-1 text-xs" variant="secondary">
                <Tags className="size-3.5" />
                {total} items
              </Badge>
              <Badge className="gap-1.5 px-2.5 py-1 text-xs" variant="secondary">
                <Filter className="size-3.5" />
                {activeFilterCount} active filters
              </Badge>
            </div>
          </div>
          <div className="bg-primary/20 pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl" />
        </header>

        <Card className="border-primary/10 shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="text-primary size-4" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters();
              }}
            >
              <div className="space-y-1.5">
                <label className="text-muted-foreground text-xs font-medium" htmlFor="catalog-q">
                  Keyword
                </label>
                <Input
                  id="catalog-q"
                  name="q"
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      q: event.target.value,
                    }))
                  }
                  placeholder="Search item..."
                  value={draft.q}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-muted-foreground text-xs font-medium"
                  htmlFor="catalog-category"
                >
                  Category
                </label>
                <Select
                  onValueChange={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      categoryId: value === "all" ? "" : value,
                    }))
                  }
                  value={draft.categoryId || "all"}
                >
                  <SelectTrigger className="w-full" id="catalog-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categoriesQuery.data?.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesQuery.isLoading ? (
                  <p className="text-muted-foreground text-xs">Loading categories...</p>
                ) : null}
                {selectedCategoryPath ? (
                  <Link
                    className="text-primary inline-flex text-xs font-medium hover:underline"
                    to={`/c/${selectedCategoryPath}`}
                  >
                    Browse this category page
                  </Link>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-muted-foreground text-xs font-medium"
                  htmlFor="catalog-end-mode"
                >
                  Closing time
                </label>
                <Select
                  onValueChange={(value: DeadlinePreset) =>
                    setDraft((prev) => ({
                      ...prev,
                      deadlinePreset: value,
                    }))
                  }
                  value={draft.deadlinePreset}
                >
                  <SelectTrigger className="w-full" id="catalog-end-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any closing time</SelectItem>
                    <SelectItem value="24h">Ends in next 24 hours</SelectItem>
                    <SelectItem value="3d">Ends in next 3 days</SelectItem>
                    <SelectItem value="7d">Ends in next 7 days</SelectItem>
                    <SelectItem value="custom">Choose specific date & time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {draft.deadlinePreset === "custom" ? (
                <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                  <label
                    className="text-muted-foreground text-xs font-medium"
                    htmlFor="catalog-end-before"
                  >
                    Ends before (custom)
                  </label>
                  <Input
                    id="catalog-end-before"
                    name="endBefore"
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        customEndBefore: event.target.value,
                      }))
                    }
                    type="datetime-local"
                    value={draft.customEndBefore}
                  />
                </div>
              ) : null}

              <div className="bg-muted/30 space-y-3 rounded-lg border p-3 md:col-span-2 lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Price range</p>
                  <p className="text-muted-foreground text-xs">
                    {draftMinPrice != null ? formatCurrency(draftMinPrice) : "No minimum"} -{" "}
                    {draftMaxPrice != null ? formatCurrency(draftMaxPrice) : "No maximum"}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      className="text-muted-foreground text-xs font-medium"
                      htmlFor="catalog-min-range"
                    >
                      Minimum price
                    </label>
                    <Input
                      id="catalog-min-range"
                      max={draftMaxPrice}
                      min={PRICE_MIN_BOUND}
                      onChange={(event) => {
                        const raw = Number(event.target.value);
                        if (!Number.isFinite(raw)) {
                          setDraft((prev) => ({ ...prev, minPriceInput: "" }));
                          return;
                        }
                        const nextValue = clampPrice(raw);
                        setDraft((prev) => ({
                          ...prev,
                          minPriceInput: String(
                            draftMaxPrice != null ? Math.min(nextValue, draftMaxPrice) : nextValue,
                          ),
                        }));
                      }}
                      step={PRICE_STEP}
                      type="number"
                      value={draft.minPriceInput}
                    />
                    <p className="text-xs font-medium">
                      {draftMinPrice != null ? formatCurrency(draftMinPrice) : "No minimum"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-muted-foreground text-xs font-medium"
                      htmlFor="catalog-max-range"
                    >
                      Maximum price
                    </label>
                    <Input
                      id="catalog-max-range"
                      min={draftMinPrice ?? PRICE_MIN_BOUND}
                      onChange={(event) => {
                        const raw = Number(event.target.value);
                        if (!Number.isFinite(raw)) {
                          setDraft((prev) => ({ ...prev, maxPriceInput: "" }));
                          return;
                        }
                        const nextValue = clampPrice(raw);
                        setDraft((prev) => ({
                          ...prev,
                          maxPriceInput: String(
                            draftMinPrice != null ? Math.max(nextValue, draftMinPrice) : nextValue,
                          ),
                        }));
                      }}
                      step={PRICE_STEP}
                      type="number"
                      value={draft.maxPriceInput}
                    />
                    <p className="text-xs font-medium">
                      {draftMaxPrice != null ? formatCurrency(draftMaxPrice) : "No maximum"}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs">
                  Use arrows on each input for fine-grained range adjustment.
                </p>
              </div>

              <div className="col-span-full flex flex-wrap gap-2">
                <Button size="sm" type="submit" variant="default">
                  Apply filters
                </Button>
                <Button onClick={resetFilters} size="sm" type="button" variant="outline">
                  Reset
                </Button>
              </div>

              {quickBrowseCategories.length > 0 ? (
                <div className="col-span-full space-y-2">
                  <p className="text-muted-foreground text-xs font-medium">
                    Quick browse by category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickBrowseCategories.map((category) => (
                      <Badge asChild key={category.id} variant="secondary">
                        <Link to={`/c/${category.slugPath}`}>{category.label}</Link>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {deadlinePreview ? (
                <p className="text-muted-foreground col-span-full text-xs">
                  Current closing filter resolves to: {deadlinePreview}
                </p>
              ) : (
                <p className="text-muted-foreground col-span-full text-xs">
                  Tip: category + price range usually gives the most precise catalog results.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {catalogQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
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
                      {listing.categoryId && categoryPathById.get(listing.categoryId) ? (
                        <Badge asChild variant="secondary">
                          <Link to={`/c/${categoryPathById.get(listing.categoryId)}`}>
                            {listing.categoryName || "Uncategorized"}
                          </Link>
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{listing.categoryName || "Uncategorized"}</Badge>
                      )}
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
                      <p className="text-foreground font-medium">
                        {formatRemainingTime(listing.endsAt)}
                      </p>
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
