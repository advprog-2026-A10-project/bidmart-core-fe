import { useState } from "react";
import { Link } from "react-router";
import { BIDDING_MOCK_PAYLOADS } from "./constant";
import { Badge } from "~/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Button } from "~/shared/components/ui/button";

export default function MyBidsPage() {
  const { bids } = BIDDING_MOCK_PAYLOADS.getMyBids.response.success;
  const [activeTab, setActiveTab] = useState("all");

  const filteredBids = activeTab === "all" ? bids : bids.filter((bid) => bid.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "winning":
        return "bg-green-500 hover:bg-green-600";
      case "outbid":
        return "bg-red-500 hover:bg-red-600";
      case "won":
        return "bg-blue-500 hover:bg-blue-600";
      case "lost":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Bids</h1>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="winning">Winning</TabsTrigger>
          <TabsTrigger value="outbid">Outbid</TabsTrigger>
          <TabsTrigger value="won">Won</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bidding Activity</CardTitle>
              <CardDescription>Track all your active and past bids here.</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBids.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center">
                  No bids found in this category.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auction Item</TableHead>
                      <TableHead>My Bid</TableHead>
                      <TableHead>Highest Bid</TableHead>
                      <TableHead>Ends At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBids.map((bid) => (
                      <TableRow key={bid.auctionId}>
                        <TableCell className="font-medium">
                          <Link to={`/auctions/${bid.auctionId}`} className="hover:underline">
                            {bid.title}
                          </Link>
                        </TableCell>
                        <TableCell>Rp {bid.myBid.toLocaleString()}</TableCell>
                        <TableCell>Rp {bid.highestBid.toLocaleString()}</TableCell>
                        <TableCell>{new Date(bid.endsAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bid.status)}>
                            {bid.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/auctions/${bid.auctionId}`}>View Auction</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
