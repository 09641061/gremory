export type SchedulingServiceViewModel = Readonly<{
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}>;

export type SchedulingMemberViewModel = Readonly<{
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  imageUrl: string | null;
  isOwner: boolean;
  availableForScheduling: boolean;
}>;

export type SchedulingCustomerViewModel = Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string;
}>;

export type SchedulingPageData = Readonly<{
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
}>;
