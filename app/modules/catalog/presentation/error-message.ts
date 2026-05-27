import { AppError } from "~/shared/domain/errors/app-error";
import { NetworkError } from "~/shared/domain/errors/network-error";
import { NotFoundError } from "~/shared/domain/errors/not-found-error";
import { ValidationError } from "~/shared/domain/errors/validation-error";

function resolveValidationDescription(
  fieldErrors?: Record<string, string[]>,
  fallback?: string,
): string {
  if (!fieldErrors) return fallback ?? "Validation failed.";

  const requestError = fieldErrors.request?.find((item) => item.trim().length > 0);
  if (requestError) return requestError;

  const firstError = Object.values(fieldErrors)
    .flat()
    .find((item) => item.trim().length > 0);
  if (firstError) return firstError;

  return fallback ?? "Validation failed.";
}

export function getCatalogUiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof NotFoundError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return resolveValidationDescription(error.fieldErrors, error.message);
  }

  if (error instanceof NetworkError) {
    switch (error.statusCode) {
      case 400:
        return "Request is invalid. Please check input values.";
      case 401:
        return "You need to sign in to continue.";
      case 403:
        return "You are not allowed to access this listing.";
      case 404:
        return "Listing was not found.";
      case 409:
        return "Action conflicts with the current listing state.";
      case 422:
        return error.message || "Validation failed. Please review the form.";
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
