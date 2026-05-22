import type { OrderStage } from "~/modules/order/domain/entities/order";

export type ListOrdersDTO = {
  userId?: string;
  role: "buyer" | "seller";
  stage?: OrderStage;
  limit?: number;
  offset?: number;
};

export type GetOrderDTO = {
  orderId: string;
};

export type ConfirmOrderDTO = {
  orderId: string;
  actorId?: string;
};

export type CreateDisputeDTO = {
  orderId: string;
  reporterId?: string;
  reason: string;
  details?: string;
};

export type UpdateShippingStatusDTO = {
  orderId: string;
  status: string;
  tracking?: string;
};
