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
  DisputeForm,
  type DisputeFormValues,
} from "~/modules/orders/presentation/components/dispute-form";
import { ORDERS_MOCK_PAYLOADS } from "~/modules/orders/presentation/pages/constant";

export default function OrderDisputePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (values: DisputeFormValues) => {
    // Simulate API call
    console.log("createDispute.request", {
      orderId,
      ...values,
    });

    // Simulate success
    toast.success("Dispute submitted successfully!");
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto max-w-lg py-8">
      <Card>
        <CardHeader>
          <CardTitle>Open Dispute</CardTitle>
          <CardDescription>Report an issue with Order #{orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <DisputeForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
