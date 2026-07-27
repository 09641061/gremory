export interface OrganizationSummary {
  id: string;
  ownerId: string;
  name: string;
}

export interface EstablishmentSummary {
  id: string;
  organizationId: string;
  name: string;
  photoUrl: string | null;
}

export interface PageView<T> {
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
