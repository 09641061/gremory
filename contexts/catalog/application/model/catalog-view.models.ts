export type CategoryDTO = Readonly<{
  id: string;
  establishmentId?: string;
  name: string;
}>;

export type ServiceSummaryDTO = Readonly<{
  id: string;
  establishmentId?: string;
  name: string;
  categoryId?: string | null;
}>;

export type DetailedServiceDTO = Readonly<{
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  preparationMinutes: number;
  cleanupMinutes: number;
  categoryId?: string | null;
  preServiceInstructions?: string | null;
  postServiceRecommendations?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
}>;
