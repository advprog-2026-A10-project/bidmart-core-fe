import { AppError } from "~/shared/domain/errors/app-error";

/**
 * OrderError — base domain error for all order errors.
 * SRP: all order domain errors extend this single base.
 */
export class OrderError extends AppError {
  constructor(message: string, code: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "OrderError";
  }
}

/**
 * OrderNotFoundError — thrown when a order resource cannot be found by ID.
 */
export class OrderNotFoundError extends OrderError {
  constructor(id: string) {
    super(`Order "${id}" not found.`, "ORDER_NOT_FOUND", 404);
    this.name = "OrderNotFoundError";
  }
}
