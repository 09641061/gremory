export type CreateCatalogServiceCommand = {
  establishmentId: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  categoryId?: string | null;
  preparationMinutes?: number;
  cleanupMinutes?: number;
};

export type UpdateCatalogServiceCommand = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  categoryId?: string | null;
  preparationMinutes?: number;
  cleanupMinutes?: number;
};

export type ChangeCatalogServiceStatusCommand = {
  id: string;
  active: boolean;
};

export type DeleteCatalogServiceCommand = {
  id: string;
};

function normalizeNullableString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length === 0 ? null : str;
}

export function createCatalogServiceCreateCommand(
  input: CreateCatalogServiceCommand
): CreateCatalogServiceCommand {
  return {
    ...input,
    description: normalizeNullableString(input.description) ?? "",
    categoryId: normalizeNullableString(input.categoryId),
    preparationMinutes: input.preparationMinutes ?? 0,
    cleanupMinutes: input.cleanupMinutes ?? 0,
  };
}

export function createCatalogServiceUpdateCommand(
  input: UpdateCatalogServiceCommand
): UpdateCatalogServiceCommand {
  return {
    ...input,
    description: normalizeNullableString(input.description) ?? "",
    categoryId: normalizeNullableString(input.categoryId),
    preparationMinutes: input.preparationMinutes ?? 0,
    cleanupMinutes: input.cleanupMinutes ?? 0,
  };
}
