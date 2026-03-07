import { Link } from "react-router";
import { Badge } from "~/shared/components/ui/badge";
import { cn } from "~/lib/utils";

interface NotificationListProps {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export function NotificationList({ notifications }: NotificationListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getNotificationIcon = (type: string) => {
    // Ideally use Lucide icons here, but keeping it simple with text/badges for now
    switch (type) {
      case "order_placed":
        return "🛍️";
      case "order_shipped":
        return "🚚";
      case "bid_outbid":
        return "⚠️";
      case "auction_ended":
        return "🏁";
      default:
        return "🔔";
    }
  };

  if (notifications.length === 0) {
    return <div className="text-muted-foreground py-10 text-center">No notifications yet.</div>;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Link
          key={notification.id}
          to={`/notifications/${notification.id}`}
          className={cn(
            "hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors",
            !notification.isRead && "bg-muted/20 border-l-primary border-l-4",
          )}
        >
          <div className="pt-1 text-2xl">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  "text-sm leading-none font-medium",
                  !notification.isRead && "font-bold",
                )}
              >
                {notification.title}
              </p>
              <span className="text-muted-foreground text-xs">
                {formatDate(notification.createdAt)}
              </span>
            </div>
            <p className="text-muted-foreground line-clamp-2 text-sm">{notification.message}</p>
          </div>
          {!notification.isRead && <div className="bg-primary mt-2 h-2 w-2 rounded-full" />}
        </Link>
      ))}
    </div>
  );
}
