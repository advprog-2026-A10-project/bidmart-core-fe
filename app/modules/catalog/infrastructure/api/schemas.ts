import { z } from "zod";

/**
 * Zod schemas for validating raw API responses at the infrastructure boundary.
 * All API responses are validated here — never in use-cases or domain (DIP).
 */

export const catalogApiSchema = z.object({
  id: z.string(),
  // TODO: add API response fields here
});

// TODO: add additional response schemas as needed

export type CatalogApiResponse = z.infer<typeof catalogApiSchema>;
