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
