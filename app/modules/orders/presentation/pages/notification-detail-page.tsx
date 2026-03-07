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

export default function NotificationDetailPage() {
  const { notificationId } = useParams();
  const navigate = useNavigate();

  // In a real app, we would fetch based on notificationId
  const notification = ORDERS_MOCK_PAYLOADS.getNotificationDetail.response.success;

  const handleMarkAsRead = () => {
    // Simulate API call
    console.log("markNotificationRead.request", {
      notificationId: notification.id,
    });
    toast.success("Notification marked as read");
    navigate("/notifications");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  if (!notification) {
    return <div>Notification not found</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Button
        variant="ghost"
        className="mb-4 pl-0 transition-all hover:pl-2"
        onClick={() => navigate("/notifications")}
      >
        ← Back to Notifications
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl">{notification.title}</CardTitle>
            <span className="text-muted-foreground text-sm">
              {formatDate(notification.createdAt)}
            </span>
          </div>
          <CardDescription>
            Type: <span className="capitalize">{notification.type.replace("_", " ")}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{notification.message}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {!notification.isRead && <Button onClick={handleMarkAsRead}>Mark as Read</Button>}
        </CardFooter>
      </Card>
    </div>
  );
}
