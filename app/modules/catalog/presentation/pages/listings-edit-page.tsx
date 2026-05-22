import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { getCatalogUiErrorMessage } from "~/modules/catalog/presentation/error-message";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Label } from "~/shared/components/ui/label";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { Textarea } from "~/shared/components/ui/textarea";

function parseImageUrls(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export default function ListingsEditPage() {
  const { listingId = "" } = useParams();
  const useCases = getCatalogUseCases();
  const queryClient = useQueryClient();

  const [description, setDescription] = React.useState("");
  const [imageUrlsText, setImageUrlsText] = React.useState("");
  const [initialized, setInitialized] = React.useState(false);

  const detailQuery = useQuery({
    enabled: Boolean(listingId),
    queryKey: [CATALOG_QUERY_KEYS.sellerDetail, listingId],
    queryFn: () =>
      useCases.getMyListing.execute({
        listingId,
      }),
  });

  React.useEffect(() => {
    if (!initialized && detailQuery.data) {
      setDescription(detailQuery.data.listing.description);
      setImageUrlsText(detailQuery.data.images.map((image) => image.url).join("\n"));
      setInitialized(true);
    }
  }, [detailQuery.data, initialized]);

  const updateMutation = useMutation({
    mutationFn: () =>
      useCases.updateListing.execute({
        listingId,
        description: description.trim(),
        imageUrls: parseImageUrls(imageUrlsText),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [CATALOG_QUERY_KEYS.sellerDetail, listingId],
        }),
        queryClient.invalidateQueries({
          queryKey: [CATALOG_QUERY_KEYS.sellerList],
        }),
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
            <CardTitle>Unable to edit listing</CardTitle>
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
          <h1 className="text-2xl font-bold">Edit Listing</h1>
          <p className="text-muted-foreground text-sm">
            Update description and images for <span className="font-medium">{listing.title}</span>.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editable Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  onChange={(event) => setDescription(event.target.value)}
                  rows={8}
                  value={description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-urls">Image URLs (one URL per line)</Label>
                <Textarea
                  id="image-urls"
                  onChange={(event) => setImageUrlsText(event.target.value)}
                  rows={6}
                  value={imageUrlsText}
                />
              </div>

              {updateMutation.isSuccess ? (
                <p className="rounded-md border border-emerald-400/40 bg-emerald-100/40 px-3 py-2 text-sm text-emerald-900">
                  Listing updated successfully.
                </p>
              ) : null}

              {updateMutation.isError ? (
                <p className="text-destructive border-destructive/30 bg-destructive/10 rounded-md border px-3 py-2 text-sm">
                  {getCatalogUiErrorMessage(updateMutation.error, "Failed to update listing.")}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button asChild type="button" variant="outline">
                  <Link to={`/seller/listings/${listing.id}`}>Back to detail</Link>
                </Button>
                <Button disabled={updateMutation.isPending} type="submit">
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
