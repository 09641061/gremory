/**
 * Domain-owned DTO shapes.
 */

export type CategoryDTO = Readonly<{
  id: string;
  establishmentId?: string;
  name: string;
  displayOrder?: number;
}>;

export type ServiceSummaryDTO = Readonly<{
  id: string;
  establishmentId?: string;
  name: string;
  categoryId?: string | null;
  price?: number;
  durationMinutes?: number;
  preparationMinutes?: number;
  cleanupMinutes?: number;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
}>;

export type DetailedServiceDTO = Readonly<{
  id: string;
  establishmentId: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  preparationMinutes: number;
  cleanupMinutes: number;
  categoryId?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
}>;
