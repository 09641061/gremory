export type CreateOrganizationCommand = Readonly<{ name: string }>;
export type UpdateOrganizationCommand = Readonly<{ id: string; name: string; imageUrl?: string | null }>;
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

export function createOrganizationCommand(
  input: CreateOrganizationCommand,
): CreateOrganizationCommand {
  return Object.freeze({ name: input.name });
}

export function updateOrganizationCommand(
  input: UpdateOrganizationCommand,
): UpdateOrganizationCommand {
  return Object.freeze({ id: input.id, name: input.name, imageUrl: input.imageUrl ?? null });
}

export function deleteOrganizationCommand(
  input: DeleteOrganizationCommand,
): DeleteOrganizationCommand {
  return Object.freeze({ id: input.id });
}

export function createEstablishmentCommand(
  input: CreateEstablishmentCommand,
): CreateEstablishmentCommand {
  return Object.freeze({
    organizationId: input.organizationId,
    name: input.name,
    photoUrl: input.photoUrl ?? null,
  });
}

export function updateEstablishmentCommand(
  input: UpdateEstablishmentCommand,
): UpdateEstablishmentCommand {
  return Object.freeze({
    id: input.id,
    name: input.name,
    photoUrl: input.photoUrl ?? null,
  });
}

export function deleteEstablishmentCommand(
  input: DeleteEstablishmentCommand,
): DeleteEstablishmentCommand {
  return Object.freeze({ id: input.id });
}
