import { z } from "zod";

export const createCatalogServiceSchema = z.object({
  establishmentId: z.string().uuid("establishmentId must be a valid UUID"),
  name: z.string().min(1, "Service name is required").max(150, "Maximum 150 characters"),
  description: z.string().min(1, "Service description is required").max(2000, "Maximum 2000 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  durationMinutes: z.coerce.number().int().min(1, "Minimum duration is 1 minute").max(1440, "Maximum duration is 1440 minutes"),
  categoryId: z.string().uuid("Invalid category ID").optional().nullable().or(z.literal("")),
  preServiceInstructions: z.string().max(2000, "Maximum 2000 characters").optional().nullable(),
  postServiceRecommendations: z.string().max(2000, "Maximum 2000 characters").optional().nullable(),
  preparationMinutes: z.coerce.number().int().min(0, "Minimum preparation time is 0 minutes").max(1440, "Maximum preparation time is 1440 minutes").optional().default(0),
  cleanupMinutes: z.coerce.number().int().min(0, "Minimum cleanup time is 0 minutes").max(1440, "Maximum cleanup time is 1440 minutes").optional().default(0),
});

export const updateCatalogServiceSchema = createCatalogServiceSchema.omit({ establishmentId: true }).extend({
  id: z.string().uuid("Invalid service ID"),
});

export type CreateCatalogServiceInput = z.infer<typeof createCatalogServiceSchema>;
export type UpdateCatalogServiceInput = z.infer<typeof updateCatalogServiceSchema>;
