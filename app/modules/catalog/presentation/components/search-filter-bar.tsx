import { Search } from "lucide-react";
import * as React from "react";
import { useSearchParams } from "react-router";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components/ui/select";

export function SearchFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for inputs to prevent URL thrashing while typing
  const [q, setQ] = React.useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = React.useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get("maxPrice") || "");
  const [category, setCategory] = React.useState(searchParams.get("category") || "all");

  // Sync local state when URL params change externally (e.g. back button)
  React.useEffect(() => {
    setQ(searchParams.get("q") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);

    if (q) newParams.set("q", q);
    else newParams.delete("q");

    if (minPrice) newParams.set("minPrice", minPrice);
    else newParams.delete("minPrice");

    if (maxPrice) newParams.set("maxPrice", maxPrice);
    else newParams.delete("maxPrice");

    if (category && category !== "all") newParams.set("category", category);
    else newParams.delete("category");

    // Reset page to 1 on new search
    newParams.delete("page");

    setSearchParams(newParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-sm md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <label
          htmlFor="search-q"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Search
        </label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            id="search-q"
            placeholder="Search listings..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
      </div>

      <div className="w-full space-y-2 md:w-[140px]">
        <label className="text-sm leading-none font-medium">Category</label>
        <Select value={category} onValueChange={(val) => setCategory(val)}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
            <SelectItem value="Fashion">Fashion</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Collectibles">Collectibles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full gap-2 md:w-auto">
        <div className="flex-1 space-y-2 md:w-[120px]">
          <label htmlFor="min-price" className="text-sm leading-none font-medium">
            Min Price
          </label>
          <Input
            id="min-price"
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex-1 space-y-2 md:w-[120px]">
          <label htmlFor="max-price" className="text-sm leading-none font-medium">
            Max Price
          </label>
          <Input
            id="max-price"
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full md:w-auto">
        Search
      </Button>
    </div>
  );
}
