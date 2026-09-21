/**
 * Domain-owned DTO shapes.
 *
 * These mirror the runtime contract validated by the Infrastructure
 * gateway; Application ports consume them and never import the
 * Infrastructure schema. Keeping them in Domain allows Domain services to
 * declare query return shapes without depending on Application or
 * Infrastructure.
 */

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
