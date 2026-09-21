import { z } from "zod";

export const appointmentResponseSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  serviceId: z.string().nullable(),
  customerId: z.string().nullable(),
  employeeId: z.string().nullable(),
  establishmentId: z.string().nullable(),
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  createdBy: z.string().nullable(),
  cancelledBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const appointmentPageResponseSchema = z.object({
  content: z.array(appointmentResponseSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const schedulingEmployeeSchema = z.object({
  userId: z.string().min(1),
  name: z.string(),
  imageUrl: z.string().nullable(),
  isOwner: z.boolean(),
  availableForScheduling: z.boolean(),
  visibleForScheduling: z.boolean(),
});

export const schedulingEmployeesResponseSchema = z.array(schedulingEmployeeSchema);

export const schedulingServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  price: z.number(),
  durationMinutes: z.number().int().positive(),
});

export const schedulingServicesResponseSchema = z.array(schedulingServiceSchema);

export const schedulingCustomerSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
});

export const schedulingCustomersResponseSchema = z.array(schedulingCustomerSchema);
