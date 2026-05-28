/**
 * Order — Domain Entity
 *
 * Represents the lifecycle metadata used by the presentation layer.
 */
export type Order = {
  readonly id: OrderId;
  readonly lot: string;
  readonly stage: OrderStage;
  readonly status: OrderStatus;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly total: string;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tags: string[];
  readonly lastActivity: string;
};

export type OrderStage = "active" | "processing" | "completed" | "cancelled";
export type OrderStatus =
  | "Awaiting Payment"
  | "In Transit"
  | "Needs Confirmation"
  | "Delivered"
  | "Dispute Closed"
  | "Dispute Alert";

export type OrderId = string & { readonly __brand: "OrderId" };

export function createOrderId(value: string): OrderId {
  if (!value || value.trim().length === 0) {
    throw new Error("OrderId cannot be empty.");
  }
  return value as OrderId;
}

export function createOrder(params: {
  id: string;
  lot: string;
  stage: OrderStage;
  status: OrderStatus;
  buyerId: string;
  sellerId: string;
  total: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  lastActivity: string;
}): Order {
  const missing = [
    "id",
    "lot",
    "stage",
    "status",
    "buyerId",
    "sellerId",
    "total",
    "currency",
    "createdAt",
    "updatedAt",
    "lastActivity",
  ].filter((key) => !params[key as keyof typeof params]);

  if (missing.length) {
    throw new Error(`Order is missing required fields: ${missing.join(", ")}`);
  }

  return {
    id: createOrderId(params.id),
    lot: params.lot,
    stage: params.stage,
    status: params.status,
    buyerId: params.buyerId,
    sellerId: params.sellerId,
    total: params.total,
    currency: params.currency,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    tags: params.tags ?? [],
    lastActivity: params.lastActivity,
  };
}
