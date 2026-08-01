export type CreateAppointmentCommand = Readonly<{
  title: string;
  startsAt: string;
  endsAt: string;
  serviceId: string;
  customerId: string;
  employeeId: string;
  establishmentId: string;
}>;
