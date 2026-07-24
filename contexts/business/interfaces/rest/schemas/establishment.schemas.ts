import { z } from "zod";

export const createEstablishmentSchema = z.object({
  organizationId: z.string().uuid("organizationId must be a valid UUID"),
  name: z.string().min(1, "Establishment name is required").max(150, "Maximum 150 characters"),
  photoUrl: z.string().url("Invalid photo URL").optional().nullable().or(z.literal("")),
});

export const updateEstablishmentSchema = z.object({
  id: z.string().uuid("Invalid establishment ID"),
  name: z.string().min(1, "Establishment name is required").max(150, "Maximum 150 characters"),
  photoUrl: z.string().url("Invalid photo URL").optional().nullable().or(z.literal("")),
});

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;
