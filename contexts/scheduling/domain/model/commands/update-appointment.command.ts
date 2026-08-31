export type UpdateAppointmentCommand = Readonly<{
  title: string;
  serviceId: string;
  customerId: string;
  employeeId: string;
  startsAt: string;
  endsAt: string;
}>;
