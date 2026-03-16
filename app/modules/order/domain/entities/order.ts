/**
 * Order — Domain Entity
 *
 * Pure TypeScript type with no framework or infrastructure dependencies (DIP, SRP).
 */
export type Order = {
  readonly id: OrderId;
  // TODO: add domain fields here
};

/**
 * OrderId — branded string type enforcing type safety at boundaries.
 */
export type OrderId = string & { readonly __brand: "OrderId" };

/**
 * Factory for creating a validated OrderId value object.
 */
export function createOrderId(value: string): OrderId {
  if (!value || value.trim().length === 0) {
    throw new Error("OrderId cannot be empty.");
  }
  return value as OrderId;
}

/**
 * Factory for creating a Order entity with validation.
 */
export function createOrder(params: {
  id: string;
  // TODO: add entity params here
}): Order {
  if (!params.id || params.id.trim().length === 0) {
    throw new Error("Order id cannot be empty.");
  }
  return {
    id: createOrderId(params.id),
    // TODO: map remaining fields
  };
}
