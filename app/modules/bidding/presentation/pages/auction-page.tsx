import { useState } from "react";
import { toast } from "sonner";
import { BIDDING_MOCK_PAYLOADS } from "./constant";
import { CountdownTimer } from "../components/countdown-timer";
import { BidForm } from "../components/bid-form";
import { Badge } from "~/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Separator } from "~/shared/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/shared/components/ui/avatar";

export default function AuctionPage() {
  const auction = BIDDING_MOCK_PAYLOADS.mockAuction;
  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [bids, setBids] = useState(auction.bids);

  const handleBidSubmit = (amount: number) => {
    // Simulate API call
    console.log("Placing bid:", amount);

    // Optimistic update for demo
    setCurrentBid(amount);
    const newBid = {
      bidId: `bid-${Date.now()}`,
      bidderId: "me",
      amount,
      placedAt: new Date().toISOString(),
      bidderName: "You",
    };
    setBids([newBid, ...bids]);

    toast.success("Bid placed successfully!");
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Auction Details */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-3xl">{auction.title}</CardTitle>
                  <CardDescription>Listed by {auction.seller.name}</CardDescription>
                </div>
                <Badge variant={auction.status === "active" ? "default" : "secondary"}>
                  {auction.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted text-muted-foreground flex aspect-video items-center justify-center rounded-md">
                [Product Image Placeholder]
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold">Description</h3>
                <p>{auction.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div
                    key={bid.bidId}
                    className="flex items-center justify-between border-b py-2 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{bid.bidderName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{bid.bidderName}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(bid.placedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="font-mono font-medium">Rp {bid.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bidding Controls */}
        <div className="space-y-6">
          <Card className="border-primary/20 sticky top-8 shadow-lg">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-muted-foreground text-sm tracking-wider uppercase">
                Time Remaining
              </CardTitle>
              <div className="pt-2">
                <CountdownTimer
                  endsAt={auction.endsAt}
                  className="justify-center py-2 text-3xl font-bold"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-1 text-center">
                <p className="text-muted-foreground text-sm">Current Highest Bid</p>
                <p className="text-primary text-4xl font-bold">Rp {currentBid.toLocaleString()}</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-center text-sm font-medium">
                  Minimum Increment: Rp {auction.minIncrement.toLocaleString()}
                </p>
                <BidForm
                  currentBid={currentBid}
                  minIncrement={auction.minIncrement}
                  onSubmit={handleBidSubmit}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
