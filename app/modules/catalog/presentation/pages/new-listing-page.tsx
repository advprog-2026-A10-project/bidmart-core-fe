import { useNavigate } from "react-router";
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

export function NewListingPage() {
  const navigate = useNavigate();
  const createMock = CATALOG_MOCK_PAYLOADS.createListing;

  function handleSubmit(values: ListingFormValues) {
    const request = {
      ...createMock.request,
      ...values,
      startingPrice: Number(values.startingPrice),
      auctionDuration: Number(values.auctionDuration),
    };

    console.log("Create Listing Request:", request);

    // Simulate API call
    if (createMock.response.success) {
      toast.success("Listing created!");
      void navigate("/seller/listings");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create New Listing</CardTitle>
          <CardDescription>Enter the details of the item you want to sell.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm onSubmit={handleSubmit} submitLabel="Create Listing" />
        </CardContent>
      </Card>
    </div>
  );
}
