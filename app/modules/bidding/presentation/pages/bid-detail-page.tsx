import { Link, useParams } from "react-router";
import { BIDDING_MOCK_PAYLOADS } from "./constant";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";

export default function BidDetailPage() {
  const params = useParams();
  const auctionId = params.auctionId || "auction-1";
  const auction = BIDDING_MOCK_PAYLOADS.getBidDetail.response.success;

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to={`/auctions/${auctionId}`}>&larr; Back to Auction</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{auction.title}</CardTitle>
              <CardDescription>Bid Details View</CardDescription>
            </div>
            <Badge>{auction.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-muted-foreground text-sm font-medium">Current Bid</h4>
              <p className="text-xl font-bold">Rp {auction.currentBid.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-muted-foreground text-sm font-medium">Ends At</h4>
              <p className="text-lg">{new Date(auction.endsAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h4 className="text-muted-foreground mb-2 text-sm font-medium">Bids Summary</h4>
            <p>{auction.bids.length} bids placed so far.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
