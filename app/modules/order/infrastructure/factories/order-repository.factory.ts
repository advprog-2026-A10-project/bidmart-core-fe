import { NotificationApiRepository } from "../repositories/notification-api.repository";
import { OrderApiRepository } from "../repositories/order-api.repository";
import { ConfirmOrderUseCase } from "~/modules/order/application/use-cases/confirm-order.use-case";
import { CreateDisputeUseCase } from "~/modules/order/application/use-cases/create-dispute.use-case";
import { GetOrderUseCase } from "~/modules/order/application/use-cases/get-order.use-case";
import { ListNotificationsUseCase } from "~/modules/order/application/use-cases/list-notifications.use-case";
import { ListOrdersUseCase } from "~/modules/order/application/use-cases/list-orders.use-case";
import { MarkNotificationReadUseCase } from "~/modules/order/application/use-cases/mark-notification-read.use-case";
import { UpdateShippingStatusUseCase } from "~/modules/order/application/use-cases/update-shipping-status.use-case";
import { GetNotificationUseCase } from "~/modules/order/application/use-cases/get-notification.use-case";

export type OrderUseCases = {
  listOrders: ListOrdersUseCase;
  getOrder: GetOrderUseCase;
  confirmOrder: ConfirmOrderUseCase;
  createDispute: CreateDisputeUseCase;
  updateShippingStatus: UpdateShippingStatusUseCase;
  listNotifications: ListNotificationsUseCase;
  getNotification: GetNotificationUseCase;
  markNotificationRead: MarkNotificationReadUseCase;
};

export function createOrderUseCases(): OrderUseCases {
  const orderRepository = new OrderApiRepository();
  const notificationRepository = new NotificationApiRepository();

  return {
    listOrders: new ListOrdersUseCase(orderRepository),
    getOrder: new GetOrderUseCase(orderRepository),
    confirmOrder: new ConfirmOrderUseCase(orderRepository),
    createDispute: new CreateDisputeUseCase(orderRepository),
    updateShippingStatus: new UpdateShippingStatusUseCase(orderRepository),
    listNotifications: new ListNotificationsUseCase(notificationRepository),
    getNotification: new GetNotificationUseCase(notificationRepository),
    markNotificationRead: new MarkNotificationReadUseCase(notificationRepository),
  };
}

let _orderUseCases: OrderUseCases | undefined;

export function getOrderUseCases(): OrderUseCases {
  if (!_orderUseCases) {
    _orderUseCases = createOrderUseCases();
  }
  return _orderUseCases;
}
