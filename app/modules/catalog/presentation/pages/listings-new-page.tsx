import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  Image as ImageIcon,
  Loader2,
  PlusSquare,
  Tag,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { getCatalogUiErrorMessage } from "~/modules/catalog/presentation/error-message";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components/ui/select";
import { Textarea } from "~/shared/components/ui/textarea";

function toDateTimeLocalValue(date: Date): string {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CategoryOption = {
  id: number;
  label: string;
};

type UploadedImage = {
  name: string;
  size: number;
  url: string;
};

async function loadCategoryOptions(
  listCategories: (params?: {
    parentId?: number;
  }) => Promise<Array<{ id: number; name: string; childCount: number }>>,
): Promise<CategoryOption[]> {
  const visited = new Set<number>();

  const walk = async (
    parentId: number | undefined,
    ancestors: string[],
  ): Promise<CategoryOption[]> => {
    const categories = await listCategories(parentId == null ? {} : { parentId });
    const options: CategoryOption[] = [];

    for (const category of categories) {
      if (visited.has(category.id)) continue;
      visited.add(category.id);

      const path = [...ancestors, category.name];
      if (category.childCount === 0) {
        options.push({
          id: category.id,
          label: path.join(" / "),
        });
      }

      if (category.childCount > 0) {
        const children = await walk(category.id, path);
        options.push(...children);
      }
    }

    return options;
  };

  return walk(undefined, []);
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
  const [uploadedImages, setUploadedImages] = React.useState<UploadedImage[]>([]);
  const [startPrice, setStartPrice] = React.useState("");
  const [reservePrice, setReservePrice] = React.useState("");
  const [minIncrement, setMinIncrement] = React.useState("100");
  const [startsAt, setStartsAt] = React.useState(defaultStartsAt);
  const [endsAt, setEndsAt] = React.useState(defaultEndsAt);
  const [isUploadingImages, setIsUploadingImages] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const categoriesQuery = useQuery({
    queryKey: [CATALOG_QUERY_KEYS.categories],
    queryFn: () => loadCategoryOptions((params) => useCases.listCategories.execute(params ?? {})),
    staleTime: 300_000,
  });

  const selectedCategoryLabel =
    categoriesQuery.data?.find((category) => String(category.id) === categoryId)?.label ?? null;

  const handleUploadFiles = React.useCallback(
    async (incomingFiles: FileList | null) => {
      if (!incomingFiles || incomingFiles.length === 0) return;

      const files = Array.from(incomingFiles);
      const projectedTotal = uploadedImages.length + files.length;
      if (projectedTotal > 10) {
        toast.error("Maksimal 10 gambar per listing.");
        return;
      }

      setIsUploadingImages(true);
      try {
        const newlyUploaded: UploadedImage[] = [];

        for (const file of files) {
          const presigned = await useCases.presignListingUpload.execute({
            fileName: file.name,
            contentType: file.type || undefined,
          });

          const uploadResponse = await fetch(presigned.uploadUrl, {
            method: "PUT",
            headers: file.type ? { "Content-Type": file.type } : undefined,
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          newlyUploaded.push({
            name: file.name,
            size: file.size,
            url: presigned.publicUrl,
          });
        }

        setUploadedImages((previous) => [...previous, ...newlyUploaded]);
        toast.success(`${newlyUploaded.length} gambar berhasil diupload.`);
      } catch (error) {
        toast.error(getCatalogUiErrorMessage(error, "Gagal upload gambar ke storage."));
      } finally {
        setIsUploadingImages(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [uploadedImages.length, useCases.presignListingUpload],
  );

  const createMutation = useMutation({
    mutationFn: () => {
      const trimmedTitle = title.trim();
      const numericStartPrice = Number(startPrice);
      const numericReservePrice = reservePrice.trim().length > 0 ? Number(reservePrice) : null;
      const numericMinIncrement = Number(minIncrement);
      const numericCategoryId = categoryId.trim().length > 0 ? Number(categoryId) : null;
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
        throw new Error("Category is invalid.");
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
        imageUrls: uploadedImages.map((image) => image.url),
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

  const parsedStartPrice = Number(startPrice);
  const parsedReservePrice = Number(reservePrice);
  const parsedMinIncrement = Number(minIncrement);
  const totalImages = uploadedImages.length;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Create Listing</h1>
              <p className="text-muted-foreground text-sm">
                Fill in listing details before publishing to the buyer catalog.
              </p>
            </div>
            <Button asChild size="sm" type="button" variant="outline">
              <Link to="/seller/listings">Back to listings</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PlusSquare className="text-primary size-4" />
                Listing Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
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
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}
                      value={categoryId || "none"}
                    >
                      <SelectTrigger className="w-full" id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
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
                    {categoriesQuery.isError ? (
                      <p className="text-destructive text-xs">
                        Failed to load categories. You can still create listing without category.
                      </p>
                    ) : null}
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="listing-images">Listing images</Label>
                    <p className="text-muted-foreground text-xs">{uploadedImages.length}/10 uploaded</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      accept="image/*"
                      className="max-w-md"
                      id="listing-images"
                      multiple
                      onChange={(event) => {
                        void handleUploadFiles(event.target.files);
                      }}
                      type="file"
                    />
                    {isUploadingImages ? (
                      <p className="text-muted-foreground inline-flex items-center gap-2 text-xs">
                        <Loader2 className="size-3.5 animate-spin" />
                        Uploading...
                      </p>
                    ) : (
                      <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                        <Upload className="size-3.5" />
                        JPG/PNG/WebP, maksimal 10 file
                      </p>
                    )}
                  </div>
                  {uploadedImages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {uploadedImages.map((image) => (
                        <article className="overflow-hidden rounded-lg border" key={image.url}>
                          <div className="bg-muted aspect-[4/3]">
                            <img
                              alt={image.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              src={image.url}
                            />
                          </div>
                          <div className="space-y-1 p-2">
                            <p className="truncate text-xs font-medium">{image.name}</p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-muted-foreground text-[11px]">
                                {formatFileSize(image.size)}
                              </p>
                              <Button
                                onClick={() => {
                                  setUploadedImages((previous) =>
                                    previous.filter((item) => item.url !== image.url),
                                  );
                                }}
                                size="icon"
                                type="button"
                                variant="ghost"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground rounded-md border border-dashed px-3 py-2 text-xs">
                      Belum ada gambar. Upload dulu sebelum publish agar listing lebih dipercaya.
                    </p>
                  )}
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
                  <Button disabled={createMutation.isPending || isUploadingImages} type="submit">
                    {createMutation.isPending ? "Creating..." : "Create listing"}
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link to="/seller/listings">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="text-primary size-4" />
                  Listing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Title</p>
                  <p className="font-medium">{title.trim() || "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p className="font-medium">{selectedCategoryLabel ?? "No category"}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border p-2">
                    <p className="text-muted-foreground text-xs inline-flex items-center gap-1">
                      <Wallet className="size-3.5" />
                      Start
                    </p>
                    <p className="font-semibold">
                      {Number.isFinite(parsedStartPrice) && parsedStartPrice > 0
                        ? formatCurrency(parsedStartPrice)
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-md border p-2">
                    <p className="text-muted-foreground text-xs inline-flex items-center gap-1">
                      <Wallet className="size-3.5" />
                      Reserve
                    </p>
                    <p className="font-semibold">
                      {Number.isFinite(parsedReservePrice) && parsedReservePrice >= 0
                        ? formatCurrency(parsedReservePrice)
                        : "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Minimum increment</p>
                  <p className="font-semibold">
                    {Number.isFinite(parsedMinIncrement) && parsedMinIncrement > 0
                      ? formatCurrency(parsedMinIncrement)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs inline-flex items-center gap-1">
                    <ImageIcon className="size-3.5" />
                    Images
                  </p>
                  <p className="font-medium">{totalImages} file(s)</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    Auction window
                  </p>
                  <p className="font-medium">{startsAt || "-"}</p>
                  <p className="font-medium">to {endsAt || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-xs leading-5">
                  Tip: use detailed descriptions and multiple clear photos to improve trust and bid
                  activity.
                </p>
                {selectedCategoryLabel ? (
                  <Badge className="mt-3" variant="secondary">
                    Selected: {selectedCategoryLabel}
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
