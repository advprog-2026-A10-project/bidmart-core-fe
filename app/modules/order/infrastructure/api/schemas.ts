import { z } from "zod";

/**
 * Zod schemas for validating raw API responses at the infrastructure boundary.
 * All API responses are validated here — never in use-cases or domain (DIP).
 */

export const orderApiSchema = z.object({
  id: z.string(),
  // TODO: add API response fields here
});

// TODO: add additional response schemas as needed

export type OrderApiResponse = z.infer<typeof orderApiSchema>;
