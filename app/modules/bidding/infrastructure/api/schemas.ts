import { z } from "zod";

// Backend (`bidmart-core-be`) bidding controllers serialize with camelCase,
// matching the BIDDING_ITER1_CONTRACT.md shapes. All schemas below validate
// the wire payload exactly; mapping into domain entities happens in the
// dedicated mapper, never in pages.

const auctionStatusApiSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "EXTENDED",
  "CLOSED",
  "WON",
  "UNSOLD",
]);

const bidHistoryStatusApiSchema = z.enum(["LEADING", "OUTBID"]);

const myBidStatusApiSchema = z.enum(["WINNING", "OUTBID", "WON", "LOST"]);

export const auctionApiSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  sellerId: z.string().uuid(),
  sellerName: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  startPrice: z.number().int(),
  currentPrice: z.number().int(),
  reservePrice: z.number().int().nullable(),
  bidIncrement: z.number().int(),
  bidCount: z.number().int(),
  status: auctionStatusApiSchema,
  winnerId: z.string().uuid().nullable(),
  winnerName: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  originalEndsAt: z.string(),
  extensionCount: z.number().int(),
  createdAt: z.string(),
  highestBidderAlias: z.string().nullish(),
  myLatestBid: z.number().int().nullish(),
});

export const bidHistoryEntryApiSchema = z.object({
  id: z.string().uuid(),
  auctionId: z.string().uuid(),
  bidderId: z.string().uuid(),
  bidderName: z.string(),
  amount: z.number().int(),
  isProxy: z.boolean().optional().default(false),
  isWinning: z.boolean().optional(),
  status: bidHistoryStatusApiSchema,
  acceptedAt: z.string(),
  receivedSequence: z.number().int(),
  isMyBid: z.boolean(),
});

export const auctionHistoryApiSchema = z.object({
  auction: auctionApiSchema,
  bids: z.array(bidHistoryEntryApiSchema),
  ordering: z.object({
    primary: z.string(),
    secondary: z.string(),
  }),
});

export const placeBidResultApiSchema = z.object({
  bidId: z.string().uuid(),
  auctionId: z.string().uuid(),
  currentPrice: z.number().int(),
  bidCount: z.number().int(),
  endsAt: z.string(),
  extended: z.boolean(),
  extensionCount: z.number().int(),
  minimumNextBid: z.number().int(),
  autoBidApplied: z.boolean().optional().default(false),
  effectiveWinnerId: z.string().uuid().nullish(),
});

export const proxyBidStatusApiSchema = z.object({
  auctionId: z.string().uuid(),
  bidderId: z.string().uuid(),
  enabled: z.boolean(),
  maxAmount: z.number().int().nullable(),
  auctionStatus: z.string(),
  currentPrice: z.number().int(),
  minimumProxyAmount: z.number().int(),
  currentlyLeading: z.boolean(),
  updatedAt: z.string().nullable(),
});

export const disableProxyBidApiSchema = z.object({
  auctionId: z.string().uuid(),
  bidderId: z.string().uuid(),
  disabled: z.boolean(),
});

export const myBidListItemApiSchema = z.object({
  auctionId: z.string().uuid(),
  listingId: z.string().uuid(),
  sellerId: z.string().uuid(),
  sellerName: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  startPrice: z.number().int(),
  currentPrice: z.number().int(),
  reservePrice: z.number().int().nullable(),
  bidIncrement: z.number().int(),
  bidCount: z.number().int(),
  auctionStatus: auctionStatusApiSchema,
  myBidStatus: myBidStatusApiSchema,
  winnerId: z.string().uuid().nullable(),
  winnerName: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  originalEndsAt: z.string(),
  extensionCount: z.number().int(),
  highestBidderAlias: z.string().nullish(),
  myLatestBid: z.number().int(),
  lastBidAt: z.string(),
  isReserveMet: z.boolean(),
});

export const myBidsOverviewApiSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  data: z.array(myBidListItemApiSchema),
  summary: z.object({
    all: z.number().int(),
    winning: z.number().int(),
    outbid: z.number().int(),
    won: z.number().int(),
    lost: z.number().int(),
  }),
});

export const myBidTimelineEntryApiSchema = z.object({
  at: z.string(),
  type: z.string(),
  amount: z.number().int().nullable(),
  note: z.string(),
});

export const myBidDetailApiSchema = z.object({
  auction: auctionApiSchema,
  myLatestBid: z.number().int(),
  myBidStatus: myBidStatusApiSchema,
  winningGap: z.number().int(),
  isReserveMet: z.boolean(),
  placedBidCount: z.number().int(),
  timeline: z.array(myBidTimelineEntryApiSchema),
});

export type AuctionApi = z.infer<typeof auctionApiSchema>;
export type BidHistoryEntryApi = z.infer<typeof bidHistoryEntryApiSchema>;
export type AuctionHistoryApi = z.infer<typeof auctionHistoryApiSchema>;
export type PlaceBidResultApi = z.infer<typeof placeBidResultApiSchema>;
export type ProxyBidStatusApi = z.infer<typeof proxyBidStatusApiSchema>;
export type DisableProxyBidApi = z.infer<typeof disableProxyBidApiSchema>;
export type MyBidListItemApi = z.infer<typeof myBidListItemApiSchema>;
export type MyBidsOverviewApi = z.infer<typeof myBidsOverviewApiSchema>;
export type MyBidDetailApi = z.infer<typeof myBidDetailApiSchema>;
export type MyBidTimelineEntryApi = z.infer<typeof myBidTimelineEntryApiSchema>;
