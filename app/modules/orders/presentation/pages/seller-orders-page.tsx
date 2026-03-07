import { OrderTable } from "~/modules/orders/presentation/components/order-table";
import { ORDERS_MOCK_PAYLOADS } from "~/modules/orders/presentation/pages/constant";

export default function SellerOrdersPage() {
  const { orders } = ORDERS_MOCK_PAYLOADS.getSellerOrders.response.success;

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Orders</h1>
          <p className="text-muted-foreground">Manage your sales and track shipments here.</p>
        </div>
      </div>
      <OrderTable orders={orders} role="seller" />
    </div>
  );
}
