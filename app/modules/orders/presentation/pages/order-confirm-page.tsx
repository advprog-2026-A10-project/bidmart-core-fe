import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { ORDERS_MOCK_PAYLOADS } from "~/modules/orders/presentation/pages/constant";

export default function OrderConfirmPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = ORDERS_MOCK_PAYLOADS.getBuyerOrderDetail.response.success;

  const handleConfirm = () => {
    // Simulate API call
    console.log("confirmOrder.request", {
      orderId,
    });

    // Simulate success
    toast.success("Order confirmed!");
    navigate("/orders");
  };

  return (
    <div className="container mx-auto max-w-md py-20">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Confirm Receipt</CardTitle>
          <CardDescription>Are you sure you want to confirm receipt of this order?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-muted-foreground text-sm font-medium">Order ID</p>
            <p className="font-mono">{orderId}</p>
            <div className="h-2" />
            <p className="text-muted-foreground text-sm font-medium">Item</p>
            <p className="font-semibold">{order.listingTitle}</p>
            <div className="h-2" />
            <p className="text-muted-foreground text-sm font-medium">Amount</p>
            <p className="font-semibold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(order.amount)}
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            This action will release funds to the seller and cannot be undone.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleConfirm} size="lg">
            Yes, Confirm Receipt
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
