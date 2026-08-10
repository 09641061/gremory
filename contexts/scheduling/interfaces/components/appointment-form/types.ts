export type DropdownOption = Readonly<{
  value: string;
  label: string;
  description?: string;
}>;

/** Everything the create and reschedule forms collect, before transformation. */
export type AppointmentFormValues = Readonly<{
  title: string;
  serviceId: string;
  customerId: string;
  employeeId: string;
  /** Local calendar day, `YYYY-MM-DD`. */
  startDate: string;
  /** Local 24h wall-clock time, `HH:MM`. */
  startTime: string;
}>;

export const EMPTY_APPOINTMENT_FORM_VALUES: AppointmentFormValues = {
  title: "",
  serviceId: "",
  customerId: "",
  employeeId: "",
  startDate: "",
  startTime: "",
};
