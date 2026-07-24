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
