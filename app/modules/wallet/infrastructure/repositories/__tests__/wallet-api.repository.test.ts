import { beforeEach, describe, expect, it, vi } from "vitest";

import { WalletApiRepository } from "../wallet-api.repository";

describe("WalletApiRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps getBalance response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          availableCents: 150000,
          heldCents: 50000,
          currency: "IDR",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = new WalletApiRepository();
    const result = await repository.getBalance();

    const [requestedUrl, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsedUrl = new URL(requestedUrl);
    expect(parsedUrl.pathname).toBe("/wallet");
    expect(options.method).toBe("GET");
    expect(options.credentials).toBe("include");

    expect(result.availableCents).toBe(150000);
    expect(result.heldCents).toBe(50000);
    expect(result.currency).toBe("IDR");
  });

  it("maps listTransactions response and sends expected query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              txId: "4f892db5-d3a5-42cd-a534-2145e22f0cb9",
              type: "TOPUP",
              status: "COMPLETED",
              amountCents: 100000,
              balanceAfterCents: 250000,
              createdAt: "2026-05-19T09:00:00Z",
              ref_info: {
                type: "TOPUP",
                id: "4f892db5-d3a5-42cd-a534-2145e22f0cb9",
              },
            },
          ],
          page: 2,
          pageSize: 10,
          total: 11,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = new WalletApiRepository();
    const result = await repository.listTransactions({ page: 2, pageSize: 10 });

    const [requestedUrl] = fetchMock.mock.calls[0] as [string];
    const parsedUrl = new URL(requestedUrl);
    expect(parsedUrl.pathname).toBe("/wallet/transactions");
    expect(parsedUrl.searchParams.get("page")).toBe("2");
    expect(parsedUrl.searchParams.get("pageSize")).toBe("10");

    expect(result.total).toBe(11);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.data[0]?.type).toBe("TOPUP");
    expect(result.data[0]?.refInfo?.type).toBe("TOPUP");
  });
});
