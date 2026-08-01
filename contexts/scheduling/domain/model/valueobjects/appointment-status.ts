export const AppointmentStatus = {
  SCHEDULED: "SCHEDULED",
  CANCELLED: "CANCELLED",
} as const;

export type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
