import { AppError } from "~/shared/domain/errors/app-error";
import { NetworkError } from "~/shared/domain/errors/network-error";
import { NotFoundError } from "~/shared/domain/errors/not-found-error";
import { ValidationError } from "~/shared/domain/errors/validation-error";

export function getOrderUiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof NotFoundError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    switch (error.statusCode) {
      case 400:
        return "Request is invalid. Please check the input.";
      case 404:
        return "Requested data was not found.";
      case 409:
        return "Action conflicts with current order state.";
      case 422:
        return "Request failed validation. Please review the form input.";
      default:
        return error.message || fallback;
    }
  }

  if (error instanceof AppError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
