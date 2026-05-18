import { AppError } from "~/shared/domain/errors/app-error";

export class NotificationError extends AppError {
  constructor(message: string, code: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "NotificationError";
  }
}

export class NotificationNotFoundError extends NotificationError {
  constructor(id: string) {
    super(`Notification "${id}" not found.`, "NOTIFICATION_NOT_FOUND", 404);
    this.name = "NotificationNotFoundError";
  }
}

export class NotificationAlreadyReadError extends NotificationError {
  constructor(id: string) {
    super(`Notification "${id}" already marked as read.`, "NOTIFICATION_ALREADY_READ", 409);
    this.name = "NotificationAlreadyReadError";
  }
}
