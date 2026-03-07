import { useParams, Link } from "react-router";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import { Separator } from "~/shared/components/ui/separator";
import { ORDERS_MOCK_PAYLOADS } from "~/modules/orders/presentation/pages/constant";

export default function BuyerOrderDetailPage() {
  const { orderId } = useParams();
  const order = ORDERS_MOCK_PAYLOADS.getBuyerOrderDetail.response.success;

  if (!order) {
    return <div>Order not found</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "shipped":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
        <Badge variant={getStatusColor(order.status)} className="px-4 py-1 text-lg">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seller Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Name</span>
              <p className="text-lg font-semibold">{order.sellerName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Email</span>
              <p>{order.sellerEmail}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Listing</span>
              <p className="text-lg font-semibold">{order.listingTitle}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Amount</span>
              <p className="text-2xl font-bold">{formatCurrency(order.amount)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Date Placed</span>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Shipping Address</span>
              <p className="bg-muted rounded-md p-4">{order.shippingAddress}</p>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-sm font-medium">Courier</span>
                <p>{order.courier || "Pending"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-sm font-medium">Tracking Number</span>
                <p className="font-mono">{order.trackingNumber || "Pending"}</p>
              </div>
              {order.estimatedDelivery && (
                <div className="col-span-2 space-y-1">
                  <span className="text-muted-foreground text-sm font-medium">
                    Estimated Delivery
                  </span>
                  <p>{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button variant="outline" asChild>
                <Link to={`/orders/${order.id}/dispute/new`}>Open Dispute</Link>
              </Button>
              <Button asChild>
                <Link to={`/orders/${order.id}/confirm`}>Confirm Receipt</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
