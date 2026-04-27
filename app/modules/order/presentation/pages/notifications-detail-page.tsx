"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import type { Notification } from "~/modules/order/domain/entities/notification";
import { getOrderUseCases } from "~/modules/order/infrastructure";
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
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

const CURRENT_USER_ID = "buyer-vel";
const QUERY_KEY_NOTIFICATION_DETAIL = "notification-detail";
const QUERY_KEY_NOTIFICATIONS = "notifications-page-list";

const toneByType: Record<Notification["type"], "default" | "secondary" | "outline" | "destructive" | "ghost"> = {
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

function LoadingState() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

function DetailContent({
  notification,
  markReadDisabled,
  onMarkRead,
}: {
  notification: Notification;
  markReadDisabled: boolean;
  onMarkRead: () => void;
}) {
  const metadataRows = Object.entries(notification.metadata ?? {});
  const isUnread = !notification.readAt;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Notification Detail</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{notification.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={toneByType[notification.type]}>{notification.type}</Badge>
            <Badge variant={toneByChannel[notification.channel]}>{notification.channel}</Badge>
            <Badge variant={isUnread ? "secondary" : "ghost"}>{isUnread ? "Unread" : "Read"}</Badge>
          </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Message body</CardTitle>
          <CardDescription>Primary payload from `/notifications/:notificationId`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-foreground">{notification.body}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Created at</p>
              <p className="text-sm font-medium">{formatTimestamp(notification.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Read at</p>
              <p className="text-sm font-medium">
                {notification.readAt ? formatTimestamp(notification.readAt) : "Not read yet"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notification id</p>
              <p className="text-sm font-medium">{notification.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Related order</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Optional event context passed by the publisher.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
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
                  <TableCell colSpan={2} className="text-sm text-muted-foreground">
                    No metadata for this notification.
                  </TableCell>
                </TableRow>
              ) : (
                metadataRows.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell className="font-mono text-xs">{JSON.stringify(value)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Mark-as-read action calls `PATCH /notifications/:notificationId/read`.
        </CardFooter>
      </Card>
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
        actorId: CURRENT_USER_ID,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATION_DETAIL, notificationId] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTIFICATIONS] }),
      ]);
    },
  });

  if (notificationQuery.isLoading) {
    return <LoadingState />;
  }

  if (notificationQuery.isError || !notificationQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Notification detail not available</CardTitle>
            <CardDescription>
              We could not load this notification from `/notifications/:notificationId`.
            </CardDescription>
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
    />
  );
}
