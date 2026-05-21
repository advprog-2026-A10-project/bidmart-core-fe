import { z } from "zod";

export const catalogListingApiSchema = z.object({
  id: z.string().uuid(),
  seller_id: z.string().uuid(),
  seller_name: z.string(),
  category_id: z.number().int().nullable(),
  category_name: z.string(),
  title: z.string(),
  description: z.string(),
  start_price: z.number().int(),
  reserve_price: z.number().int().nullable(),
  current_price: z.number().int(),
  min_increment: z.number().int(),
  bid_count: z.number().int(),
  status: z.string(),
  auction_id: z.string().uuid().nullable(),
  starts_at: z.string(),
  ends_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const catalogListingImageApiSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  order: z.number().int(),
});

export const paginatedCatalogListingApiSchema = z.object({
  data: z.array(catalogListingApiSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});

export const catalogListingDetailApiSchema = catalogListingApiSchema.extend({
  images: z.array(catalogListingImageApiSchema),
});

export type CatalogListingApi = z.infer<typeof catalogListingApiSchema>;
export type CatalogListingImageApi = z.infer<typeof catalogListingImageApiSchema>;
export type PaginatedCatalogListingApi = z.infer<typeof paginatedCatalogListingApiSchema>;
export type CatalogListingDetailApi = z.infer<typeof catalogListingDetailApiSchema>;
