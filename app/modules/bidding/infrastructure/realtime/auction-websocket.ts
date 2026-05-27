export type AuctionRealtimeEventType =
  | "snapshot"
  | "bidPlaced"
  | "auctionExtended"
  | "finalized"
  | "closed"
  | "error";

export type AuctionRealtimeEvent = {
  type: AuctionRealtimeEventType;
  payload: unknown;
};

type AuctionRealtimeSocketOptions = {
  auctionId: string;
  onEvent: (event: AuctionRealtimeEvent) => void;
};

const DEFAULT_SOCKET_BASE_URLS = ["ws://localhost:8083", "ws://localhost:8080"] as const;

function toWebSocketBaseUrl(value: string): string {
  const configured = value.trim();
  if (!configured) {
    return "";
  }

  if (configured.startsWith("ws://") || configured.startsWith("wss://")) {
    return configured;
  }

  if (configured.startsWith("http://")) {
    return `ws://${configured.slice("http://".length)}`;
  }

  if (configured.startsWith("https://")) {
    return `wss://${configured.slice("https://".length)}`;
  }

  return configured;
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function resolveSocketBaseUrls(): string[] {
  const configured = (import.meta.env.VITE_BIDDING_WS_URL as string | undefined)?.trim();
  const normalizedConfigured = configured ? toWebSocketBaseUrl(configured) : "";

  if (!normalizedConfigured) {
    return [...DEFAULT_SOCKET_BASE_URLS];
  }

  return uniqueValues([normalizedConfigured, ...DEFAULT_SOCKET_BASE_URLS]);
}

function buildAuctionSocketUrl(baseUrl: string, auctionId: string): string {
  const url = new URL(baseUrl);
  if (!url.searchParams.get("auctionId")) {
    url.searchParams.set("auctionId", auctionId);
  }
  if (!url.searchParams.get("topic")) {
    url.searchParams.set("topic", "auction");
  }
  return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readEventType(candidate: Record<string, unknown>): string | null {
  const keys = ["event", "type", "kind", "name"] as const;
  for (const key of keys) {
    const value = candidate[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return null;
}

function normalizeEventType(value: string | null): AuctionRealtimeEventType | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[\s_-]/g, "").toLowerCase();
  if (normalized === "snapshot") {
    return "snapshot";
  }
  if (normalized === "bidplaced" || normalized === "newbid") {
    return "bidPlaced";
  }
  if (normalized === "auctionextended" || normalized === "extended") {
    return "auctionExtended";
  }
  if (normalized === "finalized" || normalized === "auctionfinalized") {
    return "finalized";
  }
  if (normalized === "closed") {
    return "closed";
  }
  if (normalized === "error") {
    return "error";
  }

  return null;
}

function inferEventType(payload: unknown): AuctionRealtimeEventType | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (payload.closed === true) {
    return "closed";
  }
  if (
    typeof payload.id === "string" &&
    typeof payload.listingId === "string" &&
    typeof payload.currentPrice === "number"
  ) {
    return "snapshot";
  }
  if (
    typeof payload.auctionId === "string" &&
    typeof payload.currentPrice === "number" &&
    typeof payload.bidCount === "number"
  ) {
    return "bidPlaced";
  }
  if (
    typeof payload.auctionId === "string" &&
    typeof payload.endsAt === "string" &&
    typeof payload.extensionCount === "number"
  ) {
    return "auctionExtended";
  }
  if (
    typeof payload.auctionId === "string" &&
    typeof payload.status === "string" &&
    (typeof payload.finalPrice === "number" || payload.finalPrice === null)
  ) {
    return "finalized";
  }
  if (typeof payload.message === "string") {
    return "error";
  }

  return null;
}

function matchesAuction(payload: unknown, auctionId: string): boolean {
  if (!isRecord(payload)) {
    return true;
  }
  const payloadAuctionId = payload.auctionId;
  if (typeof payloadAuctionId === "string") {
    return payloadAuctionId === auctionId;
  }
  const payloadId = payload.id;
  if (typeof payloadId === "string" && typeof payload.listingId === "string") {
    return payloadId === auctionId;
  }
  return true;
}

function parseRealtimeEvent(rawMessage: string): AuctionRealtimeEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }

  const eventTypeFromEnvelope = normalizeEventType(readEventType(parsed));
  const payloadCandidate =
    parsed.payload ?? parsed.data ?? parsed.body ?? parsed.detail ?? parsed.message ?? parsed;

  const eventType = eventTypeFromEnvelope ?? inferEventType(payloadCandidate);
  if (!eventType) {
    return null;
  }

  return {
    type: eventType,
    payload: payloadCandidate,
  };
}

function sendAuctionSubscription(socket: WebSocket, auctionId: string) {
  const payload = {
    type: "subscribe",
    topic: "auction",
    auctionId,
  };

  try {
    socket.send(JSON.stringify(payload));
  } catch {
    // Ignore best-effort subscription send and rely on URL query routing.
  }
}

export function startAuctionRealtimeSocket(options: AuctionRealtimeSocketOptions): () => void {
  const { auctionId, onEvent } = options;
  const socketUrls = resolveSocketBaseUrls().map((baseUrl) =>
    buildAuctionSocketUrl(baseUrl, auctionId),
  );

  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let retryAttempt = 0;
  let urlIndex = 0;
  let shouldReconnect = true;

  const clearReconnectTimer = () => {
    if (!reconnectTimer) {
      return;
    }
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  };

  const closeSocket = () => {
    if (!socket) {
      return;
    }
    socket.close();
    socket = null;
  };

  const scheduleReconnect = () => {
    if (!shouldReconnect) {
      return;
    }

    clearReconnectTimer();
    const exponentialDelay = Math.min(15_000, 1_000 * 2 ** retryAttempt);
    const jitter = Math.floor(Math.random() * 250);
    retryAttempt += 1;
    urlIndex = (urlIndex + 1) % socketUrls.length;

    reconnectTimer = setTimeout(() => {
      connect();
    }, exponentialDelay + jitter);
  };

  const connect = () => {
    if (!shouldReconnect) {
      return;
    }

    closeSocket();
    const nextSocket = new WebSocket(socketUrls[urlIndex]);
    socket = nextSocket;

    nextSocket.onopen = () => {
      retryAttempt = 0;
      sendAuctionSubscription(nextSocket, auctionId);
    };

    nextSocket.onmessage = (messageEvent) => {
      if (typeof messageEvent.data !== "string") {
        return;
      }

      const event = parseRealtimeEvent(messageEvent.data);
      if (!event) {
        return;
      }

      if (!matchesAuction(event.payload, auctionId)) {
        return;
      }

      if (event.type === "closed") {
        shouldReconnect = false;
        clearReconnectTimer();
      }

      if (event.type === "error") {
        retryAttempt = 0;
      }

      onEvent(event);
    };

    nextSocket.onerror = () => {
      closeSocket();
      scheduleReconnect();
    };

    nextSocket.onclose = () => {
      socket = null;
      scheduleReconnect();
    };
  };

  connect();

  return () => {
    shouldReconnect = false;
    clearReconnectTimer();
    closeSocket();
  };
}
