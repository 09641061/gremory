import { z } from "zod";
import { catalogServiceResponseSchema } from "../../interfaces/rest/schemas/catalog-service.schemas";
import { serviceCategoryResponseSchema } from "../../interfaces/rest/schemas/service-category.schemas";

/** Provider response envelopes are validated at the Infrastructure boundary. */
export const catalogServicePageResponseSchema = z.object({
  content: z.array(catalogServiceResponseSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const serviceCategoryPageResponseSchema = z.object({
  content: z.array(serviceCategoryResponseSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const catalogServiceMutationResponseSchema = catalogServiceResponseSchema;
export const serviceCategoryMutationResponseSchema = serviceCategoryResponseSchema;

export type CatalogServicePageResponse = z.infer<typeof catalogServicePageResponseSchema>;
export type ServiceCategoryPageResponse = z.infer<typeof serviceCategoryPageResponseSchema>;
