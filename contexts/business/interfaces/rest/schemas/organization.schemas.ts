import { z } from "zod";

// There is no creation schema: the organization is created by the backend when
// the account registers, and no client may create one.
export const updateOrganizationSchema = z.object({
  id: z.string().uuid("Invalid organization ID"),
  name: z.string().trim().min(1, "Organization name is required").max(150),
  imageUrl: z.string().trim().max(500, "Image URL cannot exceed 500 characters").nullish(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
