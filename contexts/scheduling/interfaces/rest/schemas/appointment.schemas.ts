import { z } from "zod";

export const createAppointmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long"),
  startsAt: z.string().min(1, "Start date and time are required"),
  endsAt: z.string().min(1, "End date and time are required"),
  serviceId: z.string().uuid("Please select a valid service"),
  customerId: z.string().uuid("Please select a valid customer"),
  employeeId: z.string().uuid("Please select a valid employee"),
  establishmentId: z.string().uuid("Establishment ID is required"),
}).refine(
  (data) => {
    const start = new Date(data.startsAt).getTime();
    const end = new Date(data.endsAt).getTime();
    return end > start;
  },
  {
    message: "End time must be after start time",
    path: ["endsAt"],
  }
);

export const rescheduleAppointmentSchema = z.object({
  startsAt: z.string().min(1, "Start date and time are required"),
  endsAt: z.string().min(1, "End date and time are required"),
  reason: z.string().trim().max(500, "Reason must be at most 500 characters long").nullish(),
}).refine(
  (data) => {
    const start = new Date(data.startsAt).getTime();
    const end = new Date(data.endsAt).getTime();
    return end > start;
  },
  {
    message: "End time must be after start time",
    path: ["endsAt"],
  }
);

export const cancelAppointmentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Cancellation reason must be at least 3 characters long")
    .max(500, "Reason must be at most 500 characters long"),
});

export const updateAppointmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long"),
  startsAt: z.string().min(1, "Start date and time are required"),
  endsAt: z.string().min(1, "End date and time are required"),
  serviceId: z.string().uuid("Please select a valid service"),
  customerId: z.string().uuid("Please select a valid customer"),
  employeeId: z.string().uuid("Please select a valid employee"),
}).refine(
  (data) => {
    const start = new Date(data.startsAt).getTime();
    const end = new Date(data.endsAt).getTime();
    return end > start;
  },
  {
    message: "End time must be after start time",
    path: ["endsAt"],
  }
);
