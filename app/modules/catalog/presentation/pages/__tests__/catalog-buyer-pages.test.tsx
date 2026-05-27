import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";

import BuyerListingsDetailPage from "../buyer-listings-detail-page";
import CatalogPage from "../catalog-page";
import CategoryFilteringPage from "../category-filtering-page";

const mocked = vi.hoisted(() => {
  return {
    getCatalogUseCases: vi.fn(),
    getCatalogExecute: vi.fn(),
    listCategoriesExecute: vi.fn(),
    browseCategoryExecute: vi.fn(),
    getPublicListingExecute: vi.fn(),
  };
});

vi.mock("~/modules/catalog/infrastructure/factories/catalog-repository.factory", () => ({
  getCatalogUseCases: mocked.getCatalogUseCases,
}));

function createWrapper(initialEntry: string, routePath: string, element: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={element} path={routePath} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Catalog buyer pages", () => {
  beforeEach(() => {
    mocked.getCatalogExecute.mockReset();
    mocked.listCategoriesExecute.mockReset();
    mocked.browseCategoryExecute.mockReset();
    mocked.getPublicListingExecute.mockReset();

    mocked.getCatalogUseCases.mockReturnValue({
      getCatalog: { execute: mocked.getCatalogExecute },
      listCategories: { execute: mocked.listCategoriesExecute },
      browseCategoryPathCatalog: { execute: mocked.browseCategoryExecute },
      getPublicListing: { execute: mocked.getPublicListingExecute },
    });

    mocked.listCategoriesExecute.mockResolvedValue([]);
  });

  it("renders catalog page with query-driven listing data", async () => {
    mocked.getCatalogExecute.mockResolvedValue({
      data: [
        {
          id: "listing-1",
          sellerId: "seller-1",
          sellerName: "Seller One",
          categoryId: 12,
          categoryName: "Electronics",
          title: "Mirrorless Camera",
          description: "Good condition",
          startPrice: 5000000,
          reservePrice: null,
          currentPrice: 5500000,
          minIncrement: 100000,
          bidCount: 3,
          status: "Active",
          auctionId: null,
          startsAt: "2026-05-19T00:00:00Z",
          endsAt: "2026-05-20T00:00:00Z",
          createdAt: "2026-05-18T00:00:00Z",
          updatedAt: "2026-05-18T00:30:00Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    render(createWrapper("/catalog?q=camera&page=1&page_size=20", "/catalog", <CatalogPage />));

    await waitFor(() => {
      expect(mocked.getCatalogExecute).toHaveBeenCalledWith({
        q: "camera",
        categoryId: undefined,
        min: undefined,
        max: undefined,
        endBefore: undefined,
        page: 1,
        pageSize: 20,
      });
    });

    expect(await screen.findByText("Mirrorless Camera")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1 (1 items)")).toBeInTheDocument();
  });

  it("uses wildcard category path for category filtering", async () => {
    mocked.browseCategoryExecute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    render(createWrapper("/c/electronics/camera?page=1", "/c/*", <CategoryFilteringPage />));

    await waitFor(() => {
      expect(mocked.browseCategoryExecute).toHaveBeenCalledWith({
        categoryPath: "electronics/camera",
        page: 1,
        pageSize: 20,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("No active listings available for this category path."),
      ).toBeInTheDocument();
    });
  });

  it("loads public listing detail by route param", async () => {
    mocked.getPublicListingExecute.mockResolvedValue({
      listing: {
        id: "listing-1",
        sellerId: "seller-1",
        sellerName: "Seller One",
        categoryId: 12,
        categoryName: "Electronics",
        title: "Mirrorless Camera",
        description: "Body only",
        startPrice: 5000000,
        reservePrice: null,
        currentPrice: 5500000,
        minIncrement: 100000,
        bidCount: 3,
        status: "Active",
        auctionId: null,
        startsAt: "2026-05-19T00:00:00Z",
        endsAt: "2026-05-20T00:00:00Z",
        createdAt: "2026-05-18T00:00:00Z",
        updatedAt: "2026-05-18T00:30:00Z",
      },
      images: [],
    });

    render(
      createWrapper("/listings/listing-1", "/listings/:listingId", <BuyerListingsDetailPage />),
    );

    await waitFor(() => {
      expect(mocked.getPublicListingExecute).toHaveBeenCalledWith({
        listingId: "listing-1",
      });
    });

    expect(await screen.findByText("Mirrorless Camera")).toBeInTheDocument();
    expect(screen.getByText("No images provided for this listing.")).toBeInTheDocument();
  });

  it("disables go to live auction button when auction has not started", async () => {
    const now = Date.now();

    mocked.getPublicListingExecute.mockResolvedValue({
      listing: {
        id: "listing-1",
        sellerId: "seller-1",
        sellerName: "Seller One",
        categoryId: 12,
        categoryName: "Electronics",
        title: "Mirrorless Camera",
        description: "Body only",
        startPrice: 5000000,
        reservePrice: null,
        currentPrice: 5500000,
        minIncrement: 100000,
        bidCount: 3,
        status: "Active",
        auctionId: "55555555-5555-4555-8555-555555555555",
        startsAt: new Date(now + 60_000).toISOString(),
        endsAt: new Date(now + 120_000).toISOString(),
        createdAt: "2026-05-18T00:00:00Z",
        updatedAt: "2026-05-18T00:30:00Z",
      },
      images: [],
    });

    render(
      createWrapper("/listings/listing-1", "/listings/:listingId", <BuyerListingsDetailPage />),
    );

    const auctionButton = await screen.findByRole("button", {
      name: /go to live auction/i,
    });

    expect(auctionButton).toBeDisabled();
  });

  it("disables go to live auction button when auction is closed", async () => {
    const now = Date.now();

    mocked.getPublicListingExecute.mockResolvedValue({
      listing: {
        id: "listing-1",
        sellerId: "seller-1",
        sellerName: "Seller One",
        categoryId: 12,
        categoryName: "Electronics",
        title: "Mirrorless Camera",
        description: "Body only",
        startPrice: 5000000,
        reservePrice: null,
        currentPrice: 5500000,
        minIncrement: 100000,
        bidCount: 3,
        status: "Active",
        auctionId: "55555555-5555-4555-8555-555555555555",
        startsAt: new Date(now - 120_000).toISOString(),
        endsAt: new Date(now - 60_000).toISOString(),
        createdAt: "2026-05-18T00:00:00Z",
        updatedAt: "2026-05-18T00:30:00Z",
      },
      images: [],
    });

    render(
      createWrapper("/listings/listing-1", "/listings/:listingId", <BuyerListingsDetailPage />),
    );

    const auctionButton = await screen.findByRole("button", {
      name: /go to live auction/i,
    });

    expect(auctionButton).toBeDisabled();
  });
});
