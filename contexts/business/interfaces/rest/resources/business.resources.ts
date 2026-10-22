export interface OrganizationResource {
  id: string;
  ownerId: string;
  name: string;
  imageUrl: string | null;
}

export interface EstablishmentResource {
  id: string;
  organizationId: string;
  name: string;
  photoUrl: string | null;
  timeZone: string | null;
  currency?: "USD" | "PEN" | null;
  ownerAvailableForScheduling?: boolean;
}

export interface WhatsappStatusResource {
  establishmentId: string;
  connected: boolean;
  status: string | null;
  displayPhoneNumber: string | null;
  wabaId: string | null;
  phoneNumberId: string | null;
}

export interface PageResource<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
