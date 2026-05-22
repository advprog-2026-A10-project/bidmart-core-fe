import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { getCatalogUiErrorMessage } from "~/modules/catalog/presentation/error-message";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { Textarea } from "~/shared/components/ui/textarea";

function toDateTimeLocalValue(date: Date): string {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

function parseImageUrls(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export default function ListingsNewPage() {
  const useCases = getCatalogUseCases();
  const navigate = useNavigate();

  const now = React.useMemo(() => new Date(), []);
  const defaultStartsAt = React.useMemo(() => toDateTimeLocalValue(now), [now]);
  const defaultEndsAt = React.useMemo(() => {
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return toDateTimeLocalValue(nextDay);
  }, [now]);

  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageUrlsText, setImageUrlsText] = React.useState("");
  const [startPrice, setStartPrice] = React.useState("");
  const [reservePrice, setReservePrice] = React.useState("");
  const [minIncrement, setMinIncrement] = React.useState("100");
  const [startsAt, setStartsAt] = React.useState(defaultStartsAt);
  const [endsAt, setEndsAt] = React.useState(defaultEndsAt);

  const createMutation = useMutation({
    mutationFn: () => {
      const trimmedTitle = title.trim();
      const trimmedCategoryId = categoryId.trim();
      const numericStartPrice = Number(startPrice);
      const numericReservePrice = reservePrice.trim().length > 0 ? Number(reservePrice) : null;
      const numericMinIncrement = Number(minIncrement);
      const numericCategoryId = trimmedCategoryId.length > 0 ? Number(trimmedCategoryId) : null;
      const startsAtDate = new Date(startsAt);
      const endsAtDate = new Date(endsAt);

      if (!trimmedTitle) {
        throw new Error("Title is required.");
      }
      if (!Number.isFinite(numericStartPrice) || numericStartPrice <= 0) {
        throw new Error("Start price must be a positive number.");
      }
      if (!Number.isFinite(numericMinIncrement) || numericMinIncrement <= 0) {
        throw new Error("Minimum increment must be a positive number.");
      }
      if (
        numericCategoryId !== null &&
        (!Number.isInteger(numericCategoryId) || numericCategoryId <= 0)
      ) {
        throw new Error("Category ID must be a positive integer.");
      }
      if (
        numericReservePrice !== null &&
        (!Number.isFinite(numericReservePrice) || numericReservePrice < 0)
      ) {
        throw new Error("Reserve price must be a positive number.");
      }
      if (Number.isNaN(startsAtDate.getTime()) || Number.isNaN(endsAtDate.getTime())) {
        throw new Error("Starts at and ends at must be valid date time.");
      }
      if (endsAtDate <= startsAtDate) {
        throw new Error("Ends at must be after starts at.");
      }

      return useCases.createListing.execute({
        categoryId: numericCategoryId,
        title: trimmedTitle,
        description: description.trim(),
        imageUrls: parseImageUrls(imageUrlsText),
        startPrice: numericStartPrice,
        reservePrice: numericReservePrice,
        minIncrement: numericMinIncrement,
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString(),
      });
    },
    onSuccess: (result) => {
      navigate(`/seller/listings/${result.listing.id}`);
    },
  });

  const submitErrorMessage = getCatalogUiErrorMessage(
    createMutation.error,
    "Failed to create listing. Please review input.",
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Create Listing</h1>
          <p className="text-muted-foreground text-sm">
            Fill in listing details before publishing to the buyer catalog.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listing Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createMutation.mutate();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Example: Vintage Mechanical Keyboard"
                    value={title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-id">Category ID (optional)</Label>
                  <Input
                    id="category-id"
                    min={1}
                    onChange={(event) => setCategoryId(event.target.value)}
                    placeholder="Example: 12"
                    type="number"
                    value={categoryId}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe item condition, accessories, and notable details."
                  rows={6}
                  value={description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-urls">Image URLs (one URL per line)</Label>
                <Textarea
                  id="image-urls"
                  onChange={(event) => setImageUrlsText(event.target.value)}
                  placeholder="https://example.com/image-1.jpg"
                  rows={4}
                  value={imageUrlsText}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start-price">Start Price</Label>
                  <Input
                    id="start-price"
                    min={1}
                    onChange={(event) => setStartPrice(event.target.value)}
                    placeholder="1000000"
                    type="number"
                    value={startPrice}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reserve-price">Reserve Price (optional)</Label>
                  <Input
                    id="reserve-price"
                    min={0}
                    onChange={(event) => setReservePrice(event.target.value)}
                    placeholder="1500000"
                    type="number"
                    value={reservePrice}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-increment">Min Increment</Label>
                  <Input
                    id="min-increment"
                    min={1}
                    onChange={(event) => setMinIncrement(event.target.value)}
                    placeholder="100"
                    type="number"
                    value={minIncrement}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="starts-at">Starts At</Label>
                  <Input
                    id="starts-at"
                    onChange={(event) => setStartsAt(event.target.value)}
                    type="datetime-local"
                    value={startsAt}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends-at">Ends At</Label>
                  <Input
                    id="ends-at"
                    onChange={(event) => setEndsAt(event.target.value)}
                    type="datetime-local"
                    value={endsAt}
                  />
                </div>
              </div>

              {createMutation.isError ? (
                <p className="text-destructive border-destructive/30 bg-destructive/10 rounded-md border px-3 py-2 text-sm">
                  {submitErrorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button asChild type="button" variant="outline">
                  <Link to="/seller/listings">Back to listings</Link>
                </Button>
                <Button disabled={createMutation.isPending} type="submit">
                  {createMutation.isPending ? "Creating..." : "Create listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
