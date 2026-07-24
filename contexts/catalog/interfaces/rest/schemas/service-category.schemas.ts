import { z } from "zod";

export const createServiceCategorySchema = z.object({
  establishmentId: z.string().uuid("establishmentId must be a valid UUID"),
  name: z.string().min(1, "Category name is required").max(100, "Maximum 100 characters"),
});

export const updateServiceCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID"),
  name: z.string().min(1, "Category name is required").max(100, "Maximum 100 characters"),
});

export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>;
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>;
