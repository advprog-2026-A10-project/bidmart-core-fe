// Inline DTO interfaces for orders module mock payloads

interface GetSellerOrdersResponseDTO {
  orders: Array<{
    id: string;
    buyerName: string;
    listingTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  total: number;
}

interface GetSellerOrderDetailResponseDTO {
  id: string;
  buyerName: string;
  buyerEmail: string;
  listingTitle: string;
  amount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  trackingNumber?: string;
  courier?: string;
}

interface UpdateShippingRequestDTO {
  orderId: string;
  courier: string;
  trackingNumber: string;
  estimatedDelivery: string;
}

interface UpdateShippingResponseDTO {
  success: boolean;
}

interface GetBuyerOrdersResponseDTO {
  orders: Array<{
    id: string;
    sellerName: string;
    listingTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  total: number;
}

interface GetBuyerOrderDetailResponseDTO {
  id: string;
  sellerName: string;
  sellerEmail: string;
  listingTitle: string;
  amount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
}

interface ConfirmOrderRequestDTO {
  orderId: string;
}

interface ConfirmOrderResponseDTO {
  success: boolean;
  newStatus: string;
}

interface CreateDisputeRequestDTO {
  orderId: string;
  reason: string;
  description: string;
}

interface CreateDisputeResponseDTO {
  disputeId: string;
  status: "open";
}

interface GetNotificationsResponseDTO {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  unreadCount: number;
}

interface GetNotificationDetailResponseDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId: string;
}

interface MarkNotificationReadRequestDTO {
  notificationId: string;
}

interface MarkNotificationReadResponseDTO {
  success: boolean;
}

interface MockOrderDTO {
  id: string;
  buyerName: string;
  sellerName: string;
  listingTitle: string;
  amount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  trackingNumber?: string;
  courier?: string;
}

interface MockNotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const ORDERS_MOCK_PAYLOADS = {
  getSellerOrders: {
    response: {
      success: {
        orders: [
          {
            id: "order-1",
            buyerName: "Ahmad Wijaya",
            listingTitle: "Vintage Watch",
            amount: 850000,
            status: "shipped",
            createdAt: "2026-03-10T08:00:00Z",
          },
          {
            id: "order-2",
            buyerName: "Siti Nurhaliza",
            listingTitle: "Classic Watch",
            amount: 350000,
            status: "pending",
            createdAt: "2026-03-11T10:30:00Z",
          },
          {
            id: "order-3",
            buyerName: "Rina Kusuma",
            listingTitle: "Digital Watch",
            amount: 300000,
            status: "completed",
            createdAt: "2026-03-09T14:20:00Z",
          },
        ],
        total: 3,
      } satisfies GetSellerOrdersResponseDTO,
    },
  },
  getSellerOrderDetail: {
    response: {
      success: {
        id: "order-1",
        buyerName: "Ahmad Wijaya",
        buyerEmail: "ahmad@example.com",
        listingTitle: "Vintage Watch",
        amount: 850000,
        status: "shipped",
        createdAt: "2026-03-10T08:00:00Z",
        shippingAddress: "Jl. Merdeka 123, Jakarta, 12345",
        trackingNumber: "TRK123456789",
        courier: "JNE",
      } satisfies GetSellerOrderDetailResponseDTO,
    },
  },
  updateShipping: {
    request: {
      orderId: "order-1",
      courier: "JNE",
      trackingNumber: "TRK123456789",
      estimatedDelivery: "2026-03-14T10:00:00Z",
    } satisfies UpdateShippingRequestDTO,
    response: {
      success: {
        success: true,
      } satisfies UpdateShippingResponseDTO,
    },
  },
  getBuyerOrders: {
    response: {
      success: {
        orders: [
          {
            id: "order-1",
            sellerName: "Budi Santoso",
            listingTitle: "Vintage Watch",
            amount: 850000,
            status: "shipped",
            createdAt: "2026-03-10T08:00:00Z",
          },
          {
            id: "order-4",
            sellerName: "Ahmad Wijaya",
            listingTitle: "Digital Watch",
            amount: 300000,
            status: "completed",
            createdAt: "2026-03-08T12:15:00Z",
          },
        ],
        total: 2,
      } satisfies GetBuyerOrdersResponseDTO,
    },
  },
  getBuyerOrderDetail: {
    response: {
      success: {
        id: "order-1",
        sellerName: "Budi Santoso",
        sellerEmail: "budi@example.com",
        listingTitle: "Vintage Watch",
        amount: 850000,
        status: "shipped",
        createdAt: "2026-03-10T08:00:00Z",
        shippingAddress: "Jl. Ahmad Yani 456, Surabaya, 67890",
        trackingNumber: "TRK123456789",
        courier: "JNE",
        estimatedDelivery: "2026-03-14T10:00:00Z",
      } satisfies GetBuyerOrderDetailResponseDTO,
    },
  },
  confirmOrder: {
    request: {
      orderId: "order-1",
    } satisfies ConfirmOrderRequestDTO,
    response: {
      success: {
        success: true,
        newStatus: "completed",
      } satisfies ConfirmOrderResponseDTO,
    },
  },
  createDispute: {
    request: {
      orderId: "order-1",
      reason: "Item not as described",
      description: "The watch condition is worse than shown in the listing",
    } satisfies CreateDisputeRequestDTO,
    response: {
      success: {
        disputeId: "dispute-1",
        status: "open" as const,
      } satisfies CreateDisputeResponseDTO,
    },
  },
  getNotifications: {
    response: {
      success: {
        notifications: [
          {
            id: "notif-1",
            type: "order_placed",
            title: "Order Placed",
            message: "Your order for Vintage Watch has been placed",
            isRead: false,
            createdAt: "2026-03-10T08:00:00Z",
          },
          {
            id: "notif-2",
            type: "order_shipped",
            title: "Order Shipped",
            message: "Your order has been shipped with tracking number TRK123456789",
            isRead: false,
            createdAt: "2026-03-11T10:30:00Z",
          },
          {
            id: "notif-3",
            type: "bid_outbid",
            title: "You've Been Outbid",
            message: "Your bid of 800000 has been outbid",
            isRead: true,
            createdAt: "2026-03-09T14:20:00Z",
          },
          {
            id: "notif-4",
            type: "auction_ended",
            title: "Auction Ended",
            message: "The auction for Classic Watch has ended",
            isRead: true,
            createdAt: "2026-03-08T12:15:00Z",
          },
        ],
        unreadCount: 2,
      } satisfies GetNotificationsResponseDTO,
    },
  },
  getNotificationDetail: {
    response: {
      success: {
        id: "notif-1",
        type: "order_placed",
        title: "Order Placed",
        message: "Your order for Vintage Watch has been placed",
        isRead: false,
        createdAt: "2026-03-10T08:00:00Z",
        relatedEntityId: "order-1",
      } satisfies GetNotificationDetailResponseDTO,
    },
  },
  markNotificationRead: {
    request: {
      notificationId: "notif-1",
    } satisfies MarkNotificationReadRequestDTO,
    response: {
      success: {
        success: true,
      } satisfies MarkNotificationReadResponseDTO,
    },
  },
  mockOrders: [
    {
      id: "order-1",
      buyerName: "Ahmad Wijaya",
      sellerName: "Budi Santoso",
      listingTitle: "Vintage Watch",
      amount: 850000,
      status: "shipped",
      createdAt: "2026-03-10T08:00:00Z",
      shippingAddress: "Jl. Merdeka 123, Jakarta, 12345",
      trackingNumber: "TRK123456789",
      courier: "JNE",
    },
    {
      id: "order-2",
      buyerName: "Siti Nurhaliza",
      sellerName: "Budi Santoso",
      listingTitle: "Classic Watch",
      amount: 350000,
      status: "pending",
      createdAt: "2026-03-11T10:30:00Z",
      shippingAddress: "Jl. Ahmad Yani 456, Surabaya, 67890",
    },
    {
      id: "order-3",
      buyerName: "Rina Kusuma",
      sellerName: "Ahmad Wijaya",
      listingTitle: "Digital Watch",
      amount: 300000,
      status: "completed",
      createdAt: "2026-03-09T14:20:00Z",
      shippingAddress: "Jl. Sudirman 789, Bandung, 40123",
      trackingNumber: "TRK987654321",
      courier: "Pos Indonesia",
    },
  ] satisfies MockOrderDTO[],
  mockNotifications: [
    {
      id: "notif-1",
      type: "order_placed",
      title: "Order Placed",
      message: "Your order for Vintage Watch has been placed",
      isRead: false,
      createdAt: "2026-03-10T08:00:00Z",
    },
    {
      id: "notif-2",
      type: "order_shipped",
      title: "Order Shipped",
      message: "Your order has been shipped with tracking number TRK123456789",
      isRead: false,
      createdAt: "2026-03-11T10:30:00Z",
    },
    {
      id: "notif-3",
      type: "bid_outbid",
      title: "You've Been Outbid",
      message: "Your bid of 800000 has been outbid",
      isRead: true,
      createdAt: "2026-03-09T14:20:00Z",
    },
    {
      id: "notif-4",
      type: "auction_ended",
      title: "Auction Ended",
      message: "The auction for Classic Watch has ended",
      isRead: true,
      createdAt: "2026-03-08T12:15:00Z",
    },
  ] satisfies MockNotificationDTO[],
} as const;
