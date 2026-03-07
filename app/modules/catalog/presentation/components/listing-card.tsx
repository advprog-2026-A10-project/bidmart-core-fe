import { Link } from "react-router";
import { Badge } from "~/shared/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/shared/components/ui/card";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    currentBid: number;
    endsAt: string;
    imageUrl: string;
    category: string;
    bidCount: number;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTimeRemaining = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `Ends in ${days}d ${hours}h`;
    return `Ends in ${hours}h`;
  };

  return (
    <Link to={`/catalog/listings/${listing.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <Badge
            variant="secondary"
            className="text-foreground absolute top-2 right-2 bg-white/90 shadow-sm backdrop-blur-md"
          >
            {listing.category}
          </Badge>
        </div>

        <CardHeader className="space-y-1 p-4 pb-2">
          <CardTitle className="group-hover:text-primary line-clamp-1 text-lg transition-colors">
            {listing.title}
          </CardTitle>
          <div className="text-muted-foreground flex items-center text-sm">
            <span className="text-destructive font-medium">{getTimeRemaining(listing.endsAt)}</span>
            <span className="mx-2">•</span>
            <span>{listing.bidCount} bids</span>
          </div>
        </CardHeader>

        <CardContent className="mt-auto p-4 pt-0">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Current Bid
            </span>
            <span className="text-foreground text-xl font-bold">
              {formatCurrency(listing.currentBid)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-0" />
      </Card>
    </Link>
  );
}
