export type CreateCatalogServiceCommand = {
  establishmentId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  categoryId?: string | null;
  preServiceInstructions?: string | null;
  postServiceRecommendations?: string | null;
  preparationMinutes?: number;
  cleanupMinutes?: number;
};

export type UpdateCatalogServiceCommand = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  categoryId?: string | null;
  preServiceInstructions?: string | null;
  postServiceRecommendations?: string | null;
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

export function createCatalogServiceCreateCommand(
  input: CreateCatalogServiceCommand
): CreateCatalogServiceCommand {
  return {
    ...input,
    categoryId: normalizeNullableString(input.categoryId),
    preServiceInstructions: normalizeNullableString(input.preServiceInstructions),
    postServiceRecommendations: normalizeNullableString(input.postServiceRecommendations),
    preparationMinutes: input.preparationMinutes ?? 0,
    cleanupMinutes: input.cleanupMinutes ?? 0,
  };
}

export function createCatalogServiceUpdateCommand(
  input: UpdateCatalogServiceCommand
): UpdateCatalogServiceCommand {
  return {
    ...input,
    categoryId: normalizeNullableString(input.categoryId),
    preServiceInstructions: normalizeNullableString(input.preServiceInstructions),
    postServiceRecommendations: normalizeNullableString(input.postServiceRecommendations),
    preparationMinutes: input.preparationMinutes ?? 0,
    cleanupMinutes: input.cleanupMinutes ?? 0,
  };
}

function normalizeNullableString(value?: string | null | ""): string | null | undefined {
  if (value === "") return null;
  return value;
}
