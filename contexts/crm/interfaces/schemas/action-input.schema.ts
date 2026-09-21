import { z } from "zod";

export const establishmentIdSchema = z.string().trim().min(1).max(128);
export const customerIdSchema = z.string().trim().min(1).max(128);
export const deleteCustomerInputSchema = z.object({ id: customerIdSchema, establishmentId: establishmentIdSchema });
export const resolveDocumentInputSchema = z.object({
  type: z.enum(["dni", "ruc"]),
  number: z.string().trim().min(1).max(32),
  establishmentId: establishmentIdSchema,
});
