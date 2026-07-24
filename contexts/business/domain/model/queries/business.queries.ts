export type GetOrganizationByIdQuery = Readonly<{ id: string }>;
export type GetMyOrganizationQuery = Readonly<Record<string, never>>;
export type GetEstablishmentByIdQuery = Readonly<{ id: string }>;
export type ListEstablishmentsByOrganizationQuery = Readonly<{
  organizationId: string;
  page?: number;
  size?: number;
}>;
