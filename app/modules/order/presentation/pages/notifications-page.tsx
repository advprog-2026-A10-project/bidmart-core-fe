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
import { Checkbox } from "~/shared/components/ui/checkbox";
import { Label } from "~/shared/components/ui/label";
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

const QUERY_KEY_NOTIFICATIONS = "notifications-page-list";

const toneByType: Record<Notification["type"], "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
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

const toneByChannel: Record<Notification["channel"], "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
  email: "outline",
  push: "default",
  inbox: "secondary",
};

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const useCases = React.useMemo(() => getOrderUseCases(), []);
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: [QUERY_KEY_NOTIFICATIONS, unreadOnly],
    queryFn: () =>
      useCases.listNotifications.execute({
        limit: 20,
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

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Inbox</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Review order and bidding events from the `/notifications` endpoint.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="unread-only-filter" className="text-sm text-muted-foreground">
            <Checkbox
              id="unread-only-filter"
              checked={unreadOnly}
              onCheckedChange={(checked) => setUnreadOnly(checked === true)}
            />
            Unread only
          </Label>
          <Button variant="outline" size="sm" onClick={() => void notificationsQuery.refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total loaded</CardTitle>
            <CardDescription>Current query result size.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unread</CardTitle>
            <CardDescription>Messages that still need acknowledgement.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
            <CardDescription>Current view state.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{unreadOnly ? "Unread Only" : "All Notifications"}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification list</CardTitle>
          <CardDescription>Source: `/notifications` scoped by active auth session.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
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
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {notificationsQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-destructive">
                    {notificationsLoadErrorMessage}
                  </TableCell>
                </TableRow>
              ) : null}

              {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No notifications found for this filter.
                  </TableCell>
                </TableRow>
              ) : null}

              {notifications.map((notification) => {
                const isUnread = !notification.readAt;
                return (
                  <TableRow key={notification.id}>
                    <TableCell className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.body}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={toneByType[notification.type]}>{notification.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={toneByChannel[notification.channel]}>{notification.channel}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isUnread ? "secondary" : "ghost"}>{isUnread ? "Unread" : "Read"}</Badge>
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
            <p className="px-6 pb-4 text-sm text-destructive">{markAsReadErrorMessage}</p>
          ) : null}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Mark-as-read action uses `PATCH /notifications/:notificationId/read`.
        </CardFooter>
      </Card>
    </div>
  );
}
