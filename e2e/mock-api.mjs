import http from "node:http";

const host = process.env.E2E_API_HOST ?? "127.0.0.1";
const port = Number(process.env.E2E_API_PORT ?? 18081);
const now = "2026-05-20T10:00:00.000Z";
const future = "2026-06-20T10:00:00.000Z";

const orderId = "11111111-1111-4111-8111-111111111111";
const notificationId = "22222222-2222-4222-8222-222222222222";
const auctionId = "auction-1";
const listingId = "55555555-5555-4555-8555-555555555555";
const sellerId = "66666666-6666-4666-8666-666666666666";

const orders = [
  {
    id: orderId,
    lot: "Banksy - Shredded Beauty",
    stage: "active",
    status: "Awaiting Payment",
    buyerId: "buyer-vel",
    sellerId: "seller-adr",
    total: "$25,400,000",
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    tags: ["Escrow pending", "Anti-sniping"],
    lastActivity: "Just now",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    lot: "Banksy - Flower Thrower",
    stage: "processing",
    status: "In Transit",
    buyerId: "buyer-vel",
    sellerId: "seller-ddl",
    total: "$1,250,000",
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    tags: ["Courier: FedEx"],
    lastActivity: "6 minutes ago",
  },
];

const notifications = [
  {
    id: notificationId,
    orderId,
    title: "WinnerDetermined - Banksy - Shredded Beauty",
    body: "You won the auction and the order is ready for payment.",
    channel: "inbox",
    type: "WinnerDetermined",
    createdAt: now,
    readAt: null,
    metadata: { userId: "buyer-vel" },
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    orderId,
    title: "OrderUpdate - Shipping prepared",
    body: "The seller prepared the package for courier pickup.",
    channel: "email",
    type: "OrderUpdate",
    createdAt: now,
    readAt: now,
    metadata: { userId: "buyer-vel" },
  },
];

const auction = {
  id: auctionId,
  listingId,
  sellerId,
  sellerName: "BidMart Curated",
  title: "Leica M6 Classic Rangefinder",
  description: "A tested auction lot used by the E2E suite.",
  imageUrl: "https://placehold.co/800x600/png",
  startPrice: 5_000_000,
  currentPrice: 8_250_000,
  reservePrice: 7_000_000,
  bidIncrement: 250_000,
  bidCount: 7,
  status: "ACTIVE",
  winnerId: null,
  winnerName: null,
  startsAt: now,
  endsAt: future,
  originalEndsAt: future,
  extensionCount: 0,
  createdAt: now,
  highestBidderAlias: "Bidder A",
  myLatestBid: 8_250_000,
};

const myBid = {
  auctionId,
  listingId,
  sellerId,
  sellerName: auction.sellerName,
  title: auction.title,
  description: auction.description,
  imageUrl: auction.imageUrl,
  startPrice: auction.startPrice,
  currentPrice: auction.currentPrice,
  reservePrice: auction.reservePrice,
  bidIncrement: auction.bidIncrement,
  bidCount: auction.bidCount,
  auctionStatus: auction.status,
  myBidStatus: "WINNING",
  winnerId: auction.winnerId,
  winnerName: auction.winnerName,
  startsAt: auction.startsAt,
  endsAt: auction.endsAt,
  originalEndsAt: auction.originalEndsAt,
  extensionCount: auction.extensionCount,
  highestBidderAlias: auction.highestBidderAlias,
  myLatestBid: auction.myLatestBid,
  lastBidAt: now,
  isReserveMet: true,
  currency: "IDR",
};

const listing = {
  id: listingId,
  seller_id: sellerId,
  seller_name: "BidMart Curated",
  category_id: 1,
  category_name: "Collectibles",
  title: "Leica M6 Classic Rangefinder",
  description: "A clean listing payload for independent E2E tests.",
  start_price: 5_000_000,
  reserve_price: 7_000_000,
  current_price: 8_250_000,
  min_increment: 250_000,
  bid_count: 7,
  status: "ACTIVE",
  auction_id: "77777777-7777-4777-8777-777777777777",
  starts_at: now,
  ends_at: future,
  created_at: now,
  updated_at: now,
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": "http://127.0.0.1:3107",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}

function sendNoContent(response) {
  response.writeHead(204, {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": "http://127.0.0.1:3107",
  });
  response.end();
}

function getBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      resolve(body);
    });
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  const pathname = url.pathname;

  if (request.method === "OPTIONS") {
    sendNoContent(response);
    return;
  }

  if (pathname === "/healthz") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (!pathname.startsWith("/api/v1")) {
    sendJson(response, 404, { message: "Not found" });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/orders") {
    const stage = url.searchParams.get("stage");
    const filtered = stage ? orders.filter((order) => order.stage === stage) : orders;
    sendJson(response, 200, { data: filtered, total: filtered.length });
    return;
  }

  if (request.method === "GET" && pathname === `/api/v1/orders/${orderId}`) {
    sendJson(response, 200, orders[0]);
    return;
  }

  if (request.method === "POST" && pathname === `/api/v1/orders/${orderId}/confirm`) {
    sendNoContent(response);
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/notifications") {
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const filtered = unreadOnly
      ? notifications.filter((notification) => notification.readAt === null)
      : notifications;
    sendJson(response, 200, { data: filtered });
    return;
  }

  if (request.method === "GET" && pathname === `/api/v1/notifications/${notificationId}`) {
    sendJson(response, 200, notifications[0]);
    return;
  }

  if (request.method === "PATCH" && pathname === `/api/v1/notifications/${notificationId}/read`) {
    sendNoContent(response);
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/me/bids") {
    const status = url.searchParams.get("status");
    const data = !status || status === "winning" ? [myBid] : [];
    sendJson(response, 200, {
      user: { id: "buyer-vel", name: "Vel" },
      data,
      summary: { all: 1, winning: 1, outbid: 0, won: 0, lost: 0 },
    });
    return;
  }

  if (request.method === "GET" && pathname === `/api/v1/me/bids/${auctionId}`) {
    sendJson(response, 200, {
      auction,
      myLatestBid: 8_250_000,
      myBidStatus: "WINNING",
      winningGap: 0,
      isReserveMet: true,
      placedBidCount: 2,
      timeline: [{ at: now, type: "BID_PLACED", amount: 8_250_000, note: "You are leading." }],
    });
    return;
  }

  if (request.method === "GET" && pathname === `/api/v1/auctions/${auctionId}`) {
    sendJson(response, 200, auction);
    return;
  }

  if (request.method === "GET" && pathname === `/api/v1/auctions/${auctionId}/history`) {
    sendJson(response, 200, {
      auction,
      bids: [
        {
          id: "88888888-8888-4888-8888-888888888888",
          auctionId,
          bidderId: "buyer-vel",
          bidderName: "Bidder A",
          amount: 8_250_000,
          status: "LEADING",
          acceptedAt: now,
          receivedSequence: 1,
          isMyBid: true,
        },
      ],
      ordering: {
        primary: "acceptedAt DESC",
        secondary: "receivedSequence DESC",
      },
    });
    return;
  }

  if (request.method === "GET" && pathname === `/api/v1/auctions/${auctionId}/proxy`) {
    sendJson(response, 200, {
      auctionId,
      bidderId: "buyer-vel",
      enabled: false,
      maxAmount: null,
      auctionStatus: "ACTIVE",
      currentPrice: 8_250_000,
      minimumProxyAmount: 8_500_000,
      currentlyLeading: true,
      updatedAt: null,
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/wallet") {
    sendJson(response, 200, { availableCents: 12_000_000, heldCents: 2_000_000, currency: "IDR" });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/wallet/transactions") {
    sendJson(response, 200, { data: [], page: 1, pageSize: 10, total: 0 });
    return;
  }

  if (request.method === "POST" && pathname === "/api/v1/wallet/topup") {
    await getBody(request);
    sendJson(response, 200, {
      topupId: "99999999-9999-4999-8999-999999999999",
      status: "PENDING",
      newAvailableCents: 12_000_000,
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/v1/wallet/withdraw") {
    await getBody(request);
    sendJson(response, 200, {
      withdrawId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      status: "PENDING",
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/seller/listings") {
    sendJson(response, 200, { data: [listing], total: 1, page: 1, page_size: 10 });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/catalog") {
    sendJson(response, 200, { data: [listing], total: 1, page: 1, page_size: 10 });
    return;
  }

  sendJson(response, 404, { message: `No E2E mock for ${request.method} ${pathname}` });
});

server.listen(port, host, () => {
  console.log(`E2E mock API listening on http://${host}:${port}`);
});

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
