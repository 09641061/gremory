import { z } from "zod";

export const createServiceCategorySchema = z.object({
  establishmentId: z.string().uuid("establishmentId must be a valid UUID"),
  name: z.string().min(1, "Category name is required").max(100, "Maximum 100 characters"),
});

export const updateServiceCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID"),
  name: z.string().min(1, "Category name is required").max(100, "Maximum 100 characters"),
});

export const reorderServiceCategoriesSchema = z.object({
  establishmentId: z.string().uuid("establishmentId must be a valid UUID"),
  categoryIds: z.array(z.string().uuid("Invalid category ID")).min(1, "At least one category is required"),
});

export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>;
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>;
export type ReorderServiceCategoriesInput = z.infer<typeof reorderServiceCategoriesSchema>;

export const serviceCategoryResponseSchema = z.object({
  id: z.string().min(1),
  establishmentId: z.string().min(1),
  name: z.string().min(1),
  displayOrder: z.number().int().optional().default(0),
});
