"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

import type { Notification } from "~/modules/order/domain/entities/notification";
import { getOrderUseCases } from "~/modules/order/infrastructure";
import { getOrderUiErrorMessage } from "~/modules/order/presentation/error-message";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { ScrollArea } from "~/shared/components/ui/scroll-area";
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "~/shared/components/ui/tabs";

const QUERY_KEY_NOTIFICATIONS = "notifications-page-list";

const toneByType: Record<
  Notification["type"],
  "default" | "secondary" | "outline" | "destructive" | "ghost"
> = {
  BID_OUTBID: "secondary",
  AUCTION_WON: "default",
  AUCTION_LOST: "outline",
  ORDER_SHIPPED: "outline",
  ORDER_DELIVERED: "ghost",
  PAYMENT_RECEIVED: "default",
  DISPUTE_OPENED: "destructive",
  DISPUTE_RESOLVED: "ghost",
  AUCTION_EXTENDED: "secondary",
  BidPlaced: "secondary",
  WinnerDetermined: "default",
  OrderUpdate: "outline",
  System: "ghost",
};

const toneByChannel: Record<
  Notification["channel"],
  "default" | "secondary" | "outline" | "destructive" | "ghost"
> = {
  email: "outline",
  push: "default",
  inbox: "secondary",
};

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function getRelativeTime(iso: string) {
  const now = Date.now();
  const at = new Date(iso).getTime();
  const deltaMinutes = Math.max(1, Math.round((now - at) / (1000 * 60)));

  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}h ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays}d ago`;
}

export default function NotificationsPage() {
  const [scope, setScope] = React.useState<"all" | "unread">("all");
  const useCases = React.useMemo(() => getOrderUseCases(), []);
  const queryClient = useQueryClient();

  const unreadOnly = scope === "unread";

  const notificationsQuery = useQuery({
    queryKey: [QUERY_KEY_NOTIFICATIONS, unreadOnly],
    queryFn: () =>
      useCases.listNotifications.execute({
        limit: 40,
        unreadOnly,
      }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      useCases.markNotificationRead.execute({
        notificationId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] });
    },
  });

  const notificationsLoadErrorMessage = getOrderUiErrorMessage(
    notificationsQuery.error,
    "Unable to load notifications right now.",
  );
  const markAsReadErrorMessage = getOrderUiErrorMessage(
    markAsReadMutation.error,
    "Unable to mark notification as read.",
  );

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  const readCount = notifications.length - unreadCount;
  const latestAt = notifications[0]?.createdAt;

  const summaryStats = [
    {
      title: "Loaded",
      value: String(notifications.length),
      description: "Rows returned from current filter.",
      tag: unreadOnly ? "Unread scope" : "All scope",
    },
    {
      title: "Unread",
      value: String(unreadCount),
      description: "Messages still requiring acknowledgement.",
      tag: "Action required",
    },
    {
      title: "Read",
      value: String(readCount),
      description: "Already acknowledged messages.",
      tag: "Archived",
    },
  ];

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">Inbox center</p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Monitor bidding and order events in one unified timeline.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void notificationsQuery.refetch()}>
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/orders">Go to orders</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((item) => (
          <Card key={item.title} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold">{item.value}</p>
              <Badge variant="ghost">{item.tag}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="flex flex-col">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Notification stream</CardTitle>
              <Badge variant="outline">{unreadOnly ? "Unread" : "All"}</Badge>
            </div>
            <CardDescription>
              Source: `/notifications` scoped by authenticated session.
            </CardDescription>
            <Tabs value={scope} onValueChange={(value) => setScope(value as "all" | "unread")}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread only</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-4/5" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {notificationsQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-destructive text-sm">
                      {notificationsLoadErrorMessage}
                    </TableCell>
                  </TableRow>
                ) : null}

                {!notificationsQuery.isLoading &&
                !notificationsQuery.isError &&
                notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground text-sm">
                      <div className="flex flex-col gap-3 py-2">
                        <p>No notifications available for this filter.</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void notificationsQuery.refetch()}
                          >
                            Refresh
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/orders">Open orders</Link>
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {notifications.map((notification) => {
                  const isUnread = !notification.readAt;

                  return (
                    <TableRow
                      key={notification.id}
                      className={isUnread ? "bg-muted/30" : undefined}
                    >
                      <TableCell className="space-y-1">
                        <p className="text-foreground text-sm font-semibold">
                          {notification.title}
                        </p>
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {notification.body}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={toneByType[notification.type]}>{notification.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={toneByChannel[notification.channel]}>
                          {notification.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatTimestamp(notification.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isUnread ? "secondary" : "ghost"}>
                          {isUnread ? "Unread" : "Read"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/notifications/${notification.id}`}>View</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!isUnread || markAsReadMutation.isPending}
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            Mark read
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {markAsReadMutation.isError ? (
              <p className="text-destructive px-6 pb-4 text-sm">{markAsReadErrorMessage}</p>
            ) : null}
          </CardContent>

          <CardFooter className="text-muted-foreground text-xs">
            Action endpoint: `PATCH /notifications/:notificationId/read`.
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Live summary</CardTitle>
            <CardDescription>
              {latestAt ? `Last event at ${formatTimestamp(latestAt)}` : "No events yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="border-border h-[380px] rounded-2xl border">
              <div className="space-y-2 p-3">
                {notificationsQuery.isLoading ? (
                  <>
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </>
                ) : null}

                {!notificationsQuery.isLoading && notifications.length === 0 ? (
                  <div className="flex flex-col gap-3 px-2 py-4">
                    <p className="text-muted-foreground text-xs">
                      Timeline is empty for current filter.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void notificationsQuery.refetch()}
                      >
                        Refresh feed
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/orders">Go to orders</Link>
                      </Button>
                    </div>
                  </div>
                ) : null}

                {notifications.slice(0, 14).map((notification) => (
                  <div
                    key={`feed-${notification.id}`}
                    className="border-border/70 bg-muted/40 space-y-2 rounded-xl border p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={toneByType[notification.type]}>{notification.type}</Badge>
                      <span className="text-muted-foreground text-[11px]">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground line-clamp-2 text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {notification.body}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
