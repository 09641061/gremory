import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(150),
});

export const updateOrganizationSchema = z.object({
  id: z.string().uuid("Invalid organization ID"),
  name: z.string().trim().min(1, "Organization name is required").max(150),
  imageUrl: z.string().trim().max(500, "Image URL cannot exceed 500 characters").nullish(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
