import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Link } from "react-router";
import { CATALOG_MOCK_PAYLOADS } from "../pages/constant";

type Listing = (typeof CATALOG_MOCK_PAYLOADS)["mockListings"][number];


interface ListingTableProps {
  listings: Listing[];
}

export function ListingTable({ listings }: ListingTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Current Bid</TableHead>
            <TableHead>Bids</TableHead>
            <TableHead>Ends At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="h-10 w-10 rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{listing.title}</TableCell>
              <TableCell>{listing.startingPrice.toLocaleString()}</TableCell>
              <TableCell>{listing.currentBid.toLocaleString()}</TableCell>
              <TableCell>{listing.bidCount}</TableCell>
              <TableCell>{new Date(listing.endsAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                  {listing.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/seller/listings/${listing.id}/edit`}>Edit</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/seller/listings/${listing.id}`}>View</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
