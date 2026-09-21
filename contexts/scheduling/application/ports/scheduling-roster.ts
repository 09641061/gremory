export type SchedulingEmployee = Readonly<{
  userId: string;
  name: string;
  imageUrl: string | null;
  isOwner: boolean;
  availableForScheduling: boolean;
  visibleForScheduling: boolean;
}>;

export type SchedulingService = Readonly<{
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}>;

export type SchedulingCustomer = Readonly<{
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}>;

export interface SchedulingRosterReader {
  getSchedulingEmployees(establishmentId: string, token?: string): Promise<SchedulingEmployee[]>;
  getSchedulingServices(establishmentId: string, token?: string): Promise<SchedulingService[]>;
  getSchedulingCustomers(establishmentId: string, search?: string, token?: string): Promise<SchedulingCustomer[]>;
}

export interface SchedulingRosterWriter {
  updateEmployeeVisibility(userId: string, establishmentId: string, visible: boolean, token?: string): Promise<void>;
  updateEmployeeAvailability(userId: string, establishmentId: string, available: boolean, token?: string): Promise<void>;
}
