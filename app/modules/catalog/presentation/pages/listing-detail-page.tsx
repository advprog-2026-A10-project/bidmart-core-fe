import { Link, useParams } from "react-router";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Separator } from "~/shared/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/shared/components/ui/avatar";
import { CATALOG_MOCK_PAYLOADS } from "./constant";

export function ListingDetailPage() {
  const { listingId } = useParams();

  // Find listing or fallback
  const listing =
    CATALOG_MOCK_PAYLOADS.mockListings.find((l) => l.id === listingId) ||
    CATALOG_MOCK_PAYLOADS.getListingDetail.response.success;

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-muted overflow-hidden rounded-lg border">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="aspect-square w-full object-cover transition-all hover:scale-105"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                {listing.status}
              </Badge>
              <span className="text-muted-foreground text-sm">
                Ends: {new Date(listing.endsAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <div className="mt-2 text-2xl font-bold">
              {listing.currentBid.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </div>
            <p className="text-muted-foreground mt-1">
              Starting Price:{" "}
              {listing.startingPrice.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </p>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Category</p>
                <p className="text-muted-foreground">{listing.category}</p>
              </div>
              <div>
                <p className="font-medium">Condition</p>
                <p className="text-muted-foreground">{listing.condition}</p>
              </div>
              <div>
                <p className="font-medium">Bids</p>
                <p className="text-muted-foreground">{listing.bidCount}</p>
              </div>
              <div>
                <p className="font-medium">Seller</p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {listing.seller.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground">{listing.seller.name}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 font-medium">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild className="flex-1">
              <Link to={`/seller/listings/${listing.id}/edit`}>Edit Listing</Link>
            </Button>
            <Button asChild variant="destructive" className="flex-1">
              <Link to={`/seller/listings/${listing.id}/cancel`}>Cancel Listing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
