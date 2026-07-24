import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(150, "Maximum 150 characters"),
});

export const updateOrganizationSchema = z.object({
  id: z.string().uuid("Invalid organization ID"),
  name: z.string().min(1, "Organization name is required").max(150, "Maximum 150 characters"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
