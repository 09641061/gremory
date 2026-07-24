export type CreateOrganizationCommand = Readonly<{ name: string }>;
export type UpdateOrganizationCommand = Readonly<{ id: string; name: string }>;
export type DeleteOrganizationCommand = Readonly<{ id: string }>;

export type CreateEstablishmentCommand = Readonly<{
  organizationId: string;
  name: string;
  photoUrl?: string | null;
}>;
export type UpdateEstablishmentCommand = Readonly<{
  id: string;
  name: string;
  photoUrl?: string | null;
}>;
export type DeleteEstablishmentCommand = Readonly<{ id: string }>;
