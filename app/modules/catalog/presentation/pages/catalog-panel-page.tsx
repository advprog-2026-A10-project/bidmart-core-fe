import { useSearchParams } from "react-router";
import { CATALOG_MOCK_PAYLOADS } from "~/modules/catalog/presentation/pages/constant";
import { ListingCard } from "~/modules/catalog/presentation/components/listing-card";
import { SearchFilterBar } from "~/modules/catalog/presentation/components/search-filter-bar";

export function CatalogPanelPage() {
  const [searchParams] = useSearchParams();
  const listings = CATALOG_MOCK_PAYLOADS.mockListings;

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
        <p className="text-muted-foreground">
          Browse thousands of unique items available for auction.
        </p>
      </div>

      <SearchFilterBar />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No listings found.</p>
        </div>
      )}
    </div>
  );
}
