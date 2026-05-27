"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

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

const QUERY_KEY_NOTIFICATION_DETAIL = "notification-detail";
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

function LoadingState() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

function DetailContent({
  notification,
  markReadDisabled,
  onMarkRead,
  markReadErrorMessage,
}: {
  notification: Notification;
  markReadDisabled: boolean;
  onMarkRead: () => void;
  markReadErrorMessage: string | null;
}) {
  const metadataRows = Object.entries(notification.metadata ?? {});
  const isUnread = !notification.readAt;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">Inbox detail</p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            {notification.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            Detailed notification payload with contextual metadata.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/notifications">Back to notifications</Link>
          </Button>
          <Button size="sm" variant="outline" disabled={markReadDisabled} onClick={onMarkRead}>
            Mark as read
          </Button>
        </div>
      </header>

      {markReadErrorMessage ? (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {markReadErrorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={toneByType[notification.type]}>{notification.type}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={toneByChannel[notification.channel]}>{notification.channel}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isUnread ? "secondary" : "ghost"}>{isUnread ? "Unread" : "Read"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Created at</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{formatTimestamp(notification.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Message</CardTitle>
            <CardDescription>
              Primary payload from `/notifications/:notificationId`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-border/70 bg-muted/30 rounded-2xl border p-4">
              <p className="text-foreground text-sm leading-6">{notification.body}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">Notification ID</p>
                <p className="text-sm font-medium break-all">{notification.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Read at</p>
                <p className="text-sm font-medium">
                  {notification.readAt ? formatTimestamp(notification.readAt) : "Not read yet"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground text-xs">Related order</p>
                {notification.orderId ? (
                  <Button asChild className="px-0 text-sm" variant="link">
                    <Link to={`/orders/${notification.orderId}`}>{notification.orderId}</Link>
                  </Button>
                ) : (
                  <p className="text-sm font-medium">No order attached</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Event context supplied by publisher.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="border-border h-[260px] rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metadataRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground text-sm">
                        No metadata for this notification.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metadataRows.map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="align-top text-xs font-semibold">{key}</TableCell>
                        <TableCell className="font-mono text-[11px] break-all">
                          {JSON.stringify(value)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
          <CardFooter className="text-muted-foreground text-xs">
            Action endpoint: `PATCH /notifications/:notificationId/read`.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function NotificationsDetailPage() {
  const { notificationId = "" } = useParams();
  const useCases = React.useMemo(() => getOrderUseCases(), []);
  const queryClient = useQueryClient();

  const notificationQuery = useQuery({
    queryKey: [QUERY_KEY_NOTIFICATION_DETAIL, notificationId],
    enabled: Boolean(notificationId),
    queryFn: () =>
      useCases.getNotification.execute({
        notificationId,
      }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: () =>
      useCases.markNotificationRead.execute({
        notificationId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY_NOTIFICATION_DETAIL, notificationId],
        }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] }),
      ]);
    },
  });

  const notificationLoadErrorMessage = getOrderUiErrorMessage(
    notificationQuery.error,
    "We could not load this notification from `/notifications/:notificationId`.",
  );
  const markReadErrorMessage = markAsReadMutation.isError
    ? getOrderUiErrorMessage(markAsReadMutation.error, "Unable to mark this notification as read.")
    : null;

  if (notificationQuery.isLoading) {
    return <LoadingState />;
  }

  if (notificationQuery.isError || !notificationQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Notification detail not available</CardTitle>
            <CardDescription>{notificationLoadErrorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/notifications">Back to notifications</Link>
            </Button>
            <Button variant="outline" onClick={() => void notificationQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DetailContent
      notification={notificationQuery.data}
      markReadDisabled={!notificationQuery.data.readAt ? markAsReadMutation.isPending : true}
      onMarkRead={() => markAsReadMutation.mutate()}
      markReadErrorMessage={markReadErrorMessage}
    />
  );
}
