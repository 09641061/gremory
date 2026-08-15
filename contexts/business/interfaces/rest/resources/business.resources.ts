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
  ownerAvailableForScheduling: boolean;
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
