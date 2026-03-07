import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { ListingForm, type ListingFormValues } from "../components/listing-form";
import { CATALOG_MOCK_PAYLOADS } from "./constant";

export function ListingEditPage() {
  const navigate = useNavigate();
  const { listingId } = useParams();

  // Find listing in mock data or fallback to detail mock
  const listing =
    CATALOG_MOCK_PAYLOADS.mockListings.find((l) => l.id === listingId) ||
    CATALOG_MOCK_PAYLOADS.getListingDetail.response.success;

  const updateMock = CATALOG_MOCK_PAYLOADS.updateListing;

  function handleSubmit(values: ListingFormValues) {
    const request = {
      ...updateMock.request,
      ...values,
      startingPrice: Number(values.startingPrice),
      // Update request doesn't have auctionDuration in mock DTO but we keep it in form
    };

    console.log("Update Listing Request:", request);

    // Simulate API call
    if (updateMock.response.success) {
      toast.success("Listing updated!");
      void navigate("/seller/listings");
    }
  }

  // Cast mock string to expected enum
  const defaultValues: Partial<ListingFormValues> = {
    title: listing.title,
    description: listing.description,
    startingPrice: listing.startingPrice,
    category: listing.category as any,
    condition: listing.condition as any,
    imageUrl: listing.imageUrl,
    auctionDuration: 7, // Default as not in mock DTO
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Edit Listing</CardTitle>
          <CardDescription>Update the details of your listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
