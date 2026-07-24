import type { CatalogServiceId } from "../valueobjects/catalog-service-id.vo";
import type { Price } from "../valueobjects/price.vo";

export type CatalogServiceStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface CatalogServiceProps {
  id: CatalogServiceId;
  establishmentId: string;
  name: string;
  description: string;
  price: Price;
  durationMinutes: number;
  categoryId?: string | null;
  preServiceInstructions?: string | null;
  postServiceRecommendations?: string | null;
  preparationMinutes: number;
  cleanupMinutes: number;
  status: CatalogServiceStatus;
}

export class CatalogService {
  constructor(public readonly props: CatalogServiceProps) {}

  static create(props: CatalogServiceProps): CatalogService {
    if (!props.name.trim()) throw new Error("Service name cannot be empty");
    if (!props.description.trim()) throw new Error("Service description cannot be empty");
    if (props.durationMinutes < 1 || props.durationMinutes > 1440) {
      throw new Error("Duration must be between 1 and 1440 minutes");
    }
    return new CatalogService(props);
  }
}
