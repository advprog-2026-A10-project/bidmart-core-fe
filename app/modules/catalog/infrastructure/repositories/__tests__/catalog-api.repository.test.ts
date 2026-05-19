import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogApiRepository } from "../catalog-api.repository";

function mockListingDetailResponse() {
  return {
    id: "2d4d2f09-529e-4f97-a98b-c3f9fd581f4e",
    seller_id: "65727cbc-57f9-4b44-af5c-b49a8b66f5af",
    seller_name: "Seller Alpha",
    category_id: 12,
    category_name: "Electronics",
    title: "Mechanical Keyboard",
    description: "Good condition",
    start_price: 1200000,
    reserve_price: 1500000,
    current_price: 1300000,
    min_increment: 100000,
    bid_count: 2,
    status: "Draft",
    auction_id: null,
    starts_at: "2026-05-19T00:00:00Z",
    ends_at: "2026-05-20T00:00:00Z",
    created_at: "2026-05-18T00:00:00Z",
    updated_at: "2026-05-18T00:30:00Z",
    images: [
      {
        id: "6df2fdf3-b25c-4dba-9240-b0e2ea6f4bb3",
        url: "https://example.com/keyboard.jpg",
        order: 0,
      },
    ],
  };
}

describe("CatalogApiRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps browseCatalog response and sends expected query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "2d4d2f09-529e-4f97-a98b-c3f9fd581f4e",
              seller_id: "65727cbc-57f9-4b44-af5c-b49a8b66f5af",
              seller_name: "Seller Alpha",
              category_id: 12,
              category_name: "Electronics",
              title: "Mechanical Keyboard",
              description: "Good condition",
              start_price: 1200000,
              reserve_price: 1500000,
              current_price: 1300000,
              min_increment: 100000,
              bid_count: 2,
              status: "Active",
              auction_id: null,
              starts_at: "2026-05-19T00:00:00Z",
              ends_at: "2026-05-20T00:00:00Z",
              created_at: "2026-05-18T00:00:00Z",
              updated_at: "2026-05-18T00:30:00Z",
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = new CatalogApiRepository();
    const result = await repository.browseCatalog({
      q: "keyboard",
      categoryId: 12,
      min: 1000000,
      max: 2000000,
      endBefore: "2026-05-20T00:00:00Z",
      page: 1,
      pageSize: 20,
    });

    const [requestedUrl, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsedUrl = new URL(requestedUrl);
    expect(parsedUrl.pathname).toBe("/catalog");
    expect(parsedUrl.searchParams.get("q")).toBe("keyboard");
    expect(parsedUrl.searchParams.get("category_id")).toBe("12");
    expect(parsedUrl.searchParams.get("min")).toBe("1000000");
    expect(parsedUrl.searchParams.get("max")).toBe("2000000");
    expect(parsedUrl.searchParams.get("endBefore")).toBe("2026-05-20T00:00:00Z");
    expect(parsedUrl.searchParams.get("page")).toBe("1");
    expect(parsedUrl.searchParams.get("page_size")).toBe("20");
    expect(options.credentials).toBe("include");

    expect(result.total).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.data[0]?.sellerName).toBe("Seller Alpha");
    expect(result.data[0]?.currentPrice).toBe(1300000);
  });

  it("maps createListing payload and detail response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockListingDetailResponse()), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = new CatalogApiRepository();
    const result = await repository.createListing({
      categoryId: 12,
      title: "Mechanical Keyboard",
      description: "Good condition",
      imageUrls: ["https://example.com/keyboard.jpg"],
      startPrice: 1200000,
      reservePrice: 1500000,
      minIncrement: 100000,
      startsAt: "2026-05-19T00:00:00Z",
      endsAt: "2026-05-20T00:00:00Z",
    });

    const [requestedUrl, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsedUrl = new URL(requestedUrl);
    expect(parsedUrl.pathname).toBe("/seller/listings");
    expect(options.method).toBe("POST");

    const body = JSON.parse(String(options.body)) as Record<string, unknown>;
    expect(body.category_id).toBe(12);
    expect(body.title).toBe("Mechanical Keyboard");
    expect(body.image_urls).toEqual(["https://example.com/keyboard.jpg"]);
    expect(body.start_price).toBe(1200000);
    expect(body.reserve_price).toBe(1500000);
    expect(body.min_increment).toBe(100000);

    expect(result.listing.id).toBe("2d4d2f09-529e-4f97-a98b-c3f9fd581f4e");
    expect(result.images[0]?.url).toBe("https://example.com/keyboard.jpg");
  });
});
