import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import {
  ShippingForm,
  type ShippingFormValues,
} from "~/modules/orders/presentation/components/shipping-form";
import { ORDERS_MOCK_PAYLOADS } from "~/modules/orders/presentation/pages/constant";

export default function ShippingUpdatePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // In a real app, fetch existing shipping details
  const existingOrder = ORDERS_MOCK_PAYLOADS.getSellerOrderDetail.response.success;

  const handleSubmit = (values: ShippingFormValues) => {
    // Simulate API call
    console.log("updateShipping.request", {
      orderId,
      ...values,
    });

    // Simulate success
    toast.success("Shipping updated successfully!");
    navigate(`/seller/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto max-w-lg py-8">
      <Card>
        <CardHeader>
          <CardTitle>Update Shipping</CardTitle>
          <CardDescription>Enter tracking details for Order #{orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <ShippingForm
            onSubmit={handleSubmit}
            defaultValues={{
              courier: existingOrder.courier || "",
              trackingNumber: existingOrder.trackingNumber || "",
              estimatedDelivery: "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
