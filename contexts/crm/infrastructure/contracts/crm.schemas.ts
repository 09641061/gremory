import { z } from "zod";

export const customerDocumentTypeSchema = z.enum([
  "DNI",
  "RUC",
  "FOREIGN_RESIDENT_CARD",
  "PASSPORT",
]);

export const customerSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  establishmentId: z.string().min(1),
  documentType: customerDocumentTypeSchema,
  documentNumber: z.string().min(1),
  name: z.string().min(1),
  phoneCountryCode: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email(),
  taxpayerStatus: z.string().nullable().optional(),
  taxpayerCondition: z.string().nullable().optional(),
});

export const resolvedIdentitySchema = z.object({
  documentNumber: z.string().min(1),
  name: z.string().min(1),
  taxpayerStatus: z.string(),
  taxpayerCondition: z.string(),
});

export const customerPageResponseSchema = z.object({
  content: z.array(customerSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type CustomerDocumentType = z.infer<typeof customerDocumentTypeSchema>;
export type CustomerResponseContract = z.infer<typeof customerSchema>;
export type ResolvedIdentityContract = z.infer<typeof resolvedIdentitySchema>;
export type CustomerPageResponseContract = z.infer<typeof customerPageResponseSchema>;
