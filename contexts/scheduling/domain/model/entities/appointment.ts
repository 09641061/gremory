import { AppointmentStatusType } from "../valueobjects/appointment-status";

export type Appointment = Readonly<{
  id: string;
  title: string;
  startsAt: string; // ISO OffsetDateTime string
  endsAt: string;   // ISO OffsetDateTime string
  serviceId: string | null;
  customerId: string | null;
  employeeId: string | null;
  establishmentId: string | null;
  status: AppointmentStatusType;
  createdBy: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;
