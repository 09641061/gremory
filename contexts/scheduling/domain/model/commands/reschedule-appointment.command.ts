export type RescheduleAppointmentCommand = Readonly<{
  startsAt: string;
  endsAt: string;
  reason?: string | null;
}>;
