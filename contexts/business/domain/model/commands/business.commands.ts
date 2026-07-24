export type CreateOrganizationCommand = {
  name: string;
};

export type UpdateOrganizationCommand = {
  id: string;
  name: string;
};

export type DeleteOrganizationCommand = {
  id: string;
};

export type CreateEstablishmentCommand = {
  organizationId: string;
  name: string;
  photoUrl?: string | null;
};

export type UpdateEstablishmentCommand = {
  id: string;
  name: string;
  photoUrl?: string | null;
};

export type DeleteEstablishmentCommand = {
  id: string;
};
