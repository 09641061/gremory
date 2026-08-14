import { z } from "zod";

export const createEstablishmentSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z.string().trim().min(1, "Establishment name is required").max(100),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  timeZone: z.string().trim().min(1, "Time zone is required").max(100),
});

export const updateEstablishmentSchema = z.object({
  id: z.string().uuid("Invalid establishment ID"),
  name: z.string().trim().min(1, "Establishment name is required").max(100),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  timeZone: z.string().trim().min(1, "Time zone is required").max(100).optional().nullable(),
});

export const deleteEstablishmentSchema = z.object({
  id: z.string().uuid("Invalid establishment ID"),
});

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;
