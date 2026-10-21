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
  notes: z.string().nullable().optional(),
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
export type CustomerPageResponseContract = z.infer<typeof customerPageResponseSchema>;

export const customerAppointmentItemSchema = z.object({
  id: z.string(),
  serviceName: z.string(),
  employeeName: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  status: z.string(),
});

export const customerAppointmentSummarySchema = z.object({
  totalAppointments: z.number().int().nonnegative(),
  completedAppointments: z.number().int().nonnegative(),
  noShowCount: z.number().int().nonnegative(),
  lastOrNextVisitAt: z.string().nullable().optional(),
  recentAppointments: z.array(customerAppointmentItemSchema),
});

export const customerOverviewResponseSchema = z.object({
  customer: customerSchema,
  appointments: customerAppointmentSummarySchema,
  whatsappConversationId: z.string().nullable().optional(),
});
