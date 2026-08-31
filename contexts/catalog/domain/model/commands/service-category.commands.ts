export type CreateServiceCategoryCommand = {
  establishmentId: string;
  name: string;
};

export type UpdateServiceCategoryCommand = {
  id: string;
  name: string;
};

export type DeleteServiceCategoryCommand = {
  id: string;
};

export function createServiceCategoryCreateCommand(input: CreateServiceCategoryCommand): CreateServiceCategoryCommand {
  return {
    establishmentId: input.establishmentId,
    name: input.name.trim(),
  };
}

export function createServiceCategoryUpdateCommand(input: UpdateServiceCategoryCommand): UpdateServiceCategoryCommand {
  return {
    id: input.id,
    name: input.name.trim(),
  };
}
