/**
 * Catalog — Domain Entity
 *
 * Pure TypeScript type with no framework or infrastructure dependencies (DIP, SRP).
 */
export type Catalog = {
  readonly id: CatalogId;
  // TODO: add domain fields here
};

/**
 * CatalogId — branded string type enforcing type safety at boundaries.
 */
export type CatalogId = string & { readonly __brand: "CatalogId" };

/**
 * Factory for creating a validated CatalogId value object.
 */
export function createCatalogId(value: string): CatalogId {
  if (!value || value.trim().length === 0) {
    throw new Error("CatalogId cannot be empty.");
  }
  return value as CatalogId;
}

/**
 * Factory for creating a Catalog entity with validation.
 */
export function createCatalog(params: {
  id: string;
  // TODO: add entity params here
}): Catalog {
  if (!params.id || params.id.trim().length === 0) {
    throw new Error("Catalog id cannot be empty.");
  }
  return {
    id: createCatalogId(params.id),
    // TODO: map remaining fields
  };
}
