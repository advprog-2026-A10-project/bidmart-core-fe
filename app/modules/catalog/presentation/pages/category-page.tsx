import { Link, useParams } from "react-router";
import { CATALOG_MOCK_PAYLOADS } from "~/modules/catalog/presentation/pages/constant";
import { ListingCard } from "~/modules/catalog/presentation/components/listing-card";
import { SearchFilterBar } from "~/modules/catalog/presentation/components/search-filter-bar";
import { ChevronRight, Home } from "lucide-react";

export function CategoryPage() {
  const { "*": categoryPath } = useParams();
  const listings = CATALOG_MOCK_PAYLOADS.mockListings;

  // Simple capitalization for display
  const displayCategory = categoryPath
    ? categoryPath
        .split("/")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" / ")
    : "All Categories";

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 md:px-6">
      <nav className="text-muted-foreground flex items-center text-sm">
        <Link to="/" className="hover:text-foreground flex items-center transition-colors">
          <Home className="mr-1 h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <Link to="/catalog" className="hover:text-foreground transition-colors">
          Catalog
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-foreground font-medium">{displayCategory}</span>
      </nav>

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{displayCategory}</h1>
        <p className="text-muted-foreground">Browse the best items in {displayCategory}.</p>
      </div>

      <SearchFilterBar />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
