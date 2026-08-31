export const AppointmentStatus = {
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
