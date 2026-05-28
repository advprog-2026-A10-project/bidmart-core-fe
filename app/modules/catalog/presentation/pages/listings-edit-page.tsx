import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, FileText, Image as ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

import { getCatalogUseCases } from "~/modules/catalog/infrastructure/factories/catalog-repository.factory";
import { getCatalogUiErrorMessage } from "~/modules/catalog/presentation/error-message";
import { CATALOG_QUERY_KEYS } from "~/modules/catalog/presentation/query-keys";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { Skeleton } from "~/shared/components/ui/skeleton";
import { Textarea } from "~/shared/components/ui/textarea";

type UploadedImage = {
  name: string;
  size?: number;
  url: string;
};

function extractFileName(url: string): string {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split("/").pop();
    if (!segment) return "image";
    return decodeURIComponent(segment);
  } catch {
    return "image";
  }
}

function formatFileSize(bytes?: number): string {
  if (bytes == null || !Number.isFinite(bytes)) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ListingsEditPage() {
  const { listingId = "" } = useParams();
  const useCases = getCatalogUseCases();
  const queryClient = useQueryClient();

  const [description, setDescription] = React.useState("");
  const [uploadedImages, setUploadedImages] = React.useState<UploadedImage[]>([]);
  const [initialized, setInitialized] = React.useState(false);
  const [isUploadingImages, setIsUploadingImages] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
      setUploadedImages(
        detailQuery.data.images.map((image) => ({
          name: extractFileName(image.url),
          url: image.url,
        })),
      );
      setInitialized(true);
    }
  }, [detailQuery.data, initialized]);

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

  const updateMutation = useMutation({
    mutationFn: () =>
      useCases.updateListing.execute({
        listingId,
        description: description.trim(),
        imageUrls: uploadedImages.map((image) => image.url),
      }),
    onSuccess: async () => {
      toast.success("Listing berhasil diperbarui.");
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
  const imageCount = uploadedImages.length;
  const descriptionLength = description.trim().length;
  const canModifyListing =
    (listing.status === "Draft" || listing.status === "Active") && listing.bidCount === 0;
  const blockedEditReason =
    listing.status === "Cancelled"
      ? "Listing ini sudah dibatalkan dan tidak bisa diedit lagi."
      : listing.bidCount > 0
        ? "Listing yang sudah memiliki bid tidak bisa diedit."
        : "Listing ini tidak dapat diedit pada status saat ini.";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="space-y-6">
        <header className="border-primary/15 from-primary/10 via-background to-background rounded-2xl border bg-gradient-to-br p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
              <p className="text-muted-foreground text-sm">
                Update listing content and image gallery before publishing changes.
              </p>
            </div>
            <Button asChild size="sm" type="button" variant="outline">
              <Link to={`/seller/listings/${listing.id}`}>Back to detail</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="text-primary size-4" />
                Editable Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!canModifyListing ? (
                <p className="text-destructive border-destructive/30 bg-destructive/10 mb-4 rounded-md border px-3 py-2 text-sm">
                  {blockedEditReason}
                </p>
              ) : null}
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!canModifyListing) return;
                  updateMutation.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    disabled={!canModifyListing}
                    id="description"
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe condition updates, accessories, and extra notes."
                    rows={7}
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
                      disabled={!canModifyListing}
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
                        {!canModifyListing
                          ? "Editing image is disabled for this listing state"
                          : "JPG/PNG/WebP, maksimal 10 file"}
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
                                disabled={!canModifyListing}
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
                      Belum ada gambar. Upload gambar untuk meningkatkan kualitas listing.
                    </p>
                  )}
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
                  <Button
                    disabled={updateMutation.isPending || isUploadingImages || !canModifyListing}
                    type="submit"
                  >
                    <Save className="size-4" />
                    {updateMutation.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="text-primary size-4" />
                  Listing Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Title</p>
                  <p className="font-medium">{listing.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Current status</p>
                  <p className="font-medium">{listing.status}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border p-2">
                    <p className="text-muted-foreground text-xs inline-flex items-center gap-1">
                      <Camera className="size-3.5" />
                      Images
                    </p>
                    <p className="font-semibold">{imageCount}</p>
                  </div>
                  <div className="rounded-md border p-2">
                    <p className="text-muted-foreground text-xs inline-flex items-center gap-1">
                      <FileText className="size-3.5" />
                      Description
                    </p>
                    <p className="font-semibold">{descriptionLength} chars</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-xs leading-5">
                  Tip: gunakan foto close-up dan update deskripsi kondisi terbaru agar buyer lebih
                  percaya dan bidding lebih aktif.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
