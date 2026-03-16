import { AppError } from "~/shared/domain/errors/app-error";

/**
 * CatalogError — base domain error for all catalog errors.
 * SRP: all catalog domain errors extend this single base.
 */
export class CatalogError extends AppError {
  constructor(message: string, code: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "CatalogError";
  }
}

/**
 * CatalogNotFoundError — thrown when a catalog resource cannot be found by ID.
 */
export class CatalogNotFoundError extends CatalogError {
  constructor(id: string) {
    super(`Catalog "${id}" not found.`, "CATALOG_NOT_FOUND", 404);
    this.name = "CatalogNotFoundError";
  }
}
