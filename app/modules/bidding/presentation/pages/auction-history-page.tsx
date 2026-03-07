import { Link, useParams } from "react-router";
import { BIDDING_MOCK_PAYLOADS } from "./constant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Button } from "~/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/shared/components/ui/card";

export default function AuctionHistoryPage() {
  const params = useParams();
  const auctionId = params.auctionId || "auction-1"; // Fallback to mock ID
  const { bids } = BIDDING_MOCK_PAYLOADS.getBidHistory.response.success;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/auctions/${auctionId}`}>Back to Auction</Link>
        </Button>
        <h1 className="text-2xl font-bold">Bid History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bids for Auction #{auctionId}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidder</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.bidId}>
                  <TableCell className="font-medium">{bid.bidderId}</TableCell>
                  <TableCell>Rp {bid.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(bid.placedAt).toLocaleString()}</TableCell>
                  <TableCell>{bid.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
