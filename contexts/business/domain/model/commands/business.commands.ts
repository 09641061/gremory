export type UpdateOrganizationCommand = Readonly<{
  id: string;
  name: string;
  imageUrl?: string | null;
  /** New logo picked by the account, stored before the write lands. */
  imageFile?: File | null;
}>;

export type CreateEstablishmentCommand = Readonly<{
  organizationId: string;
  name: string;
  photoUrl?: string | null;
  timeZone?: string | null;
  /** New photo picked by the account, stored before the write lands. */
  photoFile?: File | null;
}>;
export type UpdateEstablishmentCommand = Readonly<{
  id: string;
  name: string;
  photoUrl?: string | null;
  timeZone?: string | null;
  photoFile?: File | null;
  /** Drops the stored photo when no replacement is provided. */
  removePhoto?: boolean;
}>;
export type DeleteEstablishmentCommand = Readonly<{ id: string }>;

export function updateOrganizationCommand(
  input: UpdateOrganizationCommand,
): UpdateOrganizationCommand {
  return Object.freeze({
    id: input.id,
    name: input.name,
    imageUrl: input.imageUrl ?? null,
    imageFile: input.imageFile ?? null,
  });
}

export function createEstablishmentCommand(
  input: CreateEstablishmentCommand,
): CreateEstablishmentCommand {
  return Object.freeze({
    organizationId: input.organizationId,
    name: input.name,
    photoUrl: input.photoUrl ?? null,
    timeZone: input.timeZone ?? null,
    photoFile: input.photoFile ?? null,
  });
}

export function updateEstablishmentCommand(
  input: UpdateEstablishmentCommand,
): UpdateEstablishmentCommand {
  return Object.freeze({
    id: input.id,
    name: input.name,
    photoUrl: input.photoUrl ?? null,
    timeZone: input.timeZone ?? null,
    photoFile: input.photoFile ?? null,
    removePhoto: input.removePhoto ?? false,
  });
}

export function deleteEstablishmentCommand(
  input: DeleteEstablishmentCommand,
): DeleteEstablishmentCommand {
  return Object.freeze({ id: input.id });
}
