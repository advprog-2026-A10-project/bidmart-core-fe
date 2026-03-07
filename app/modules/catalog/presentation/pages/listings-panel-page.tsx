import { Link } from "react-router";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { ListingTable } from "../components/listing-table";
import { CATALOG_MOCK_PAYLOADS } from "./constant";

export function ListingsPanelPage() {
  const listings = CATALOG_MOCK_PAYLOADS.mockListings;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">My Listings</CardTitle>
            <CardDescription>
              Manage your active listings and view their performance.
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/seller/listings/new">Create New Listing</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ListingTable listings={listings} />
        </CardContent>
      </Card>
    </div>
  );
}
