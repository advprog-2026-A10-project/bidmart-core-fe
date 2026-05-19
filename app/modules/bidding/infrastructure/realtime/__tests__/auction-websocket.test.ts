import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { startAuctionRealtimeSocket, type AuctionRealtimeEvent } from "../auction-websocket";

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  readonly url: string;
  readonly send = vi.fn();
  readonly close = vi.fn(() => {
    this.onclose?.({} as CloseEvent);
  });

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string | URL) {
    this.url = String(url);
    MockWebSocket.instances.push(this);
  }

  static reset() {
    MockWebSocket.instances = [];
  }

  emitOpen() {
    this.onopen?.({} as Event);
  }

  emitMessage(payload: unknown) {
    const message = typeof payload === "string" ? payload : JSON.stringify(payload);
    this.onmessage?.({ data: message } as MessageEvent<string>);
  }

  emitError() {
    this.onerror?.({} as Event);
  }

  emitClose() {
    this.onclose?.({} as CloseEvent);
  }
}

describe("startAuctionRealtimeSocket", () => {
  const originalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    MockWebSocket.reset();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalWebSocket) {
      vi.stubGlobal("WebSocket", originalWebSocket);
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("connects to default ws URL and sends subscribe payload", () => {
    const stop = startAuctionRealtimeSocket({
      auctionId: "auction-1",
      onEvent: () => undefined,
    });

    expect(MockWebSocket.instances).toHaveLength(1);
    const socket = MockWebSocket.instances[0];
    expect(socket.url).toContain("ws://localhost:8080");
    expect(socket.url).toContain("auctionId=auction-1");
    expect(socket.url).toContain("topic=auction");

    socket.emitOpen();
    expect(socket.send).toHaveBeenCalledTimes(1);
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "subscribe",
        topic: "auction",
        auctionId: "auction-1",
      }),
    );

    stop();
  });

  it("parses websocket payload variants and filters events by auction id", () => {
    const receivedEvents: AuctionRealtimeEvent[] = [];

    const stop = startAuctionRealtimeSocket({
      auctionId: "auction-1",
      onEvent: (event) => receivedEvents.push(event),
    });

    const socket = MockWebSocket.instances[0];
    socket.emitOpen();

    socket.emitMessage({
      event: "snapshot",
      data: {
        id: "auction-1",
        listingId: "listing-1",
        currentPrice: 15000000,
      },
    });

    socket.emitMessage({
      auctionId: "auction-1",
      currentPrice: 15100000,
      bidCount: 13,
      minimumNextBid: 15200000,
      highestBidderAlias: "Bidder #7",
      at: "2026-05-19T13:00:00Z",
    });

    socket.emitMessage({
      type: "bid_placed",
      data: {
        auctionId: "auction-2",
        currentPrice: 16000000,
        bidCount: 14,
      },
    });

    expect(receivedEvents.map((event) => event.type)).toEqual(["snapshot", "bidPlaced"]);
    stop();
  });

  it("reconnects on error with backoff and stops reconnecting after closed event", () => {
    const stop = startAuctionRealtimeSocket({
      auctionId: "auction-1",
      onEvent: () => undefined,
    });

    expect(MockWebSocket.instances).toHaveLength(1);
    const firstSocket = MockWebSocket.instances[0];

    firstSocket.emitError();
    expect(MockWebSocket.instances).toHaveLength(1);

    vi.advanceTimersByTime(2000);
    expect(MockWebSocket.instances).toHaveLength(2);
    const secondSocket = MockWebSocket.instances[1];
    secondSocket.emitOpen();

    secondSocket.emitMessage({
      type: "closed",
      data: { closed: true },
    });
    secondSocket.emitClose();

    vi.advanceTimersByTime(30000);
    expect(MockWebSocket.instances).toHaveLength(2);

    stop();
  });
});
