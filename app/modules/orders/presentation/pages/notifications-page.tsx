import { NotificationList } from "~/modules/orders/presentation/components/notification-list";
import { ORDERS_MOCK_PAYLOADS } from "~/modules/orders/presentation/pages/constant";

export default function NotificationsPage() {
  const { notifications } = ORDERS_MOCK_PAYLOADS.getNotifications.response.success;

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
