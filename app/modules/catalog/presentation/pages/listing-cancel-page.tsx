import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { CancelListingForm, type CancelFormValues } from "../components/cancel-listing-form";
import { CATALOG_MOCK_PAYLOADS } from "./constant";

export function ListingCancelPage() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const cancelMock = CATALOG_MOCK_PAYLOADS.cancelListing;

  // Find listing to display title
  const listing =
    CATALOG_MOCK_PAYLOADS.mockListings.find((l) => l.id === listingId) ||
    CATALOG_MOCK_PAYLOADS.getListingDetail.response.success;

  function handleSubmit(values: CancelFormValues) {
    const request = {
      ...cancelMock.request,
      listingId: listingId || "unknown",
      reason: values.reason,
    };

    console.log("Cancel Listing Request:", request);

    // Simulate API call
    if (cancelMock.response.success) {
      toast.success("Listing cancelled");
      void navigate("/seller/listings");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="border-destructive/50 w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-destructive text-2xl font-bold">Cancel Listing</CardTitle>
          <CardDescription>
            Are you sure you want to cancel listing "{listing.title}"? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CancelListingForm onSubmit={handleSubmit} isSubmitting={false} />
        </CardContent>
      </Card>
    </div>
  );
}
