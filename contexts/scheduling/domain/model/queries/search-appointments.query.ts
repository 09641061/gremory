import { AppointmentStatusType } from "../valueobjects/appointment-status";

export type SearchAppointmentsQuery = Readonly<{
  from: string;
  to: string;
  employeeId?: string;
  establishmentId?: string;
  status?: AppointmentStatusType;
  page?: number;
  size?: number;
}>;
