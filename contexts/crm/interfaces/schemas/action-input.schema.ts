import { z } from "zod";

export const establishmentIdSchema = z.string().trim().min(1).max(128);
export const customerIdSchema = z.string().trim().min(1).max(128);
export const deleteCustomerInputSchema = z.object({ id: customerIdSchema, establishmentId: establishmentIdSchema });
export const updateCustomerNotesInputSchema = z.object({
  customerId: customerIdSchema,
  establishmentId: establishmentIdSchema,
  notes: z.string().max(1000),
});
