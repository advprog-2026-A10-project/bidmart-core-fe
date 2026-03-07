import { Link, useParams } from "react-router";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Separator } from "~/shared/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/shared/components/ui/avatar";
import { CATALOG_MOCK_PAYLOADS } from "~/modules/catalog/presentation/pages/constant";
import { Clock, Tag, User, Gavel, ArrowLeft } from "lucide-react";

export function BuyerListingDetailPage() {
  const { listingId } = useParams();

  // Find listing or fallback to the detailed mock response if id matches
  const listing =
    CATALOG_MOCK_PAYLOADS.mockListings.find((l) => l.id === listingId) ||
    (listingId === CATALOG_MOCK_PAYLOADS.getListingDetail.response.success.id
      ? CATALOG_MOCK_PAYLOADS.getListingDetail.response.success
      : CATALOG_MOCK_PAYLOADS.mockListings[0]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!listing) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <Button asChild className="mt-4">
          <Link to="/catalog">Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <Button variant="ghost" asChild className="hover:text-primary mb-6 pl-0 hover:bg-transparent">
        <Link to="/catalog" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="bg-muted group relative aspect-[4/3] w-full overflow-hidden rounded-xl border">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <Badge className="absolute top-4 right-4 px-3 py-1 text-base">{listing.status}</Badge>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4" />
              <span>{listing.category}</span>
              <span>•</span>
              <span>{listing.condition}</span>
            </div>
            <h1 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">{listing.title}</h1>
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Ends on {formatDate(listing.endsAt)}</span>
            </div>
          </div>

          <div className="bg-muted/30 space-y-4 rounded-lg border p-6">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Current Bid
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-primary text-3xl font-bold md:text-4xl">
                  {formatCurrency(listing.currentBid)}
                </span>
                <span className="text-muted-foreground text-sm">({listing.bidCount} bids)</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="h-12 w-full text-lg" asChild>
                <Link to={`/auctions/${listing.id}`}>
                  <Gavel className="mr-2 h-5 w-5" />
                  Place Bid
                </Link>
              </Button>
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Starting price: {formatCurrency(listing.startingPrice)}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seller Information</h3>
            <div className="hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors">
              <Avatar className="border-background h-12 w-12 border-2">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {listing.seller.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-foreground font-medium">{listing.seller.name}</p>
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <User className="h-3 w-3" />
                  <span>Rating: {listing.seller.rating} / 5.0</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
