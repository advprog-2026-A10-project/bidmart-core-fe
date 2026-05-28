import type { Notification } from "../entities/notification";
import type { Order, OrderStage } from "../entities/order";

export interface IOrderRepository {
  listOrders(params: {
    id?: string;
    role: "buyer" | "seller";
    stage?: OrderStage;
    limit?: number;
    offset?: number;
  }): Promise<Order[]>;

  getOrderById(params: { id: string }): Promise<Order>;

  confirmOrder(params: { orderId: string; actorId?: string }): Promise<void>;

  createDispute(params: {
    orderId: string;
    reporterId?: string;
    reason: string;
    details?: string;
  }): Promise<void>;

  updateShippingStatus(params: {
    orderId: string;
    status: string;
    tracking?: string;
  }): Promise<void>;
}

export interface INotificationRepository {
  listNotifications(params: {
    userId?: string;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<Notification[]>;

  getNotificationById(params: { id: string }): Promise<Notification>;

  markAsRead(params: { id: string; actorId?: string }): Promise<void>;
}
