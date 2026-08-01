export type SearchAppointmentsQuery = Readonly<{
  from: string;
  to: string;
  employeeId?: string;
  establishmentId?: string;
  status?: string;
  page?: number;
  size?: number;
}>;
