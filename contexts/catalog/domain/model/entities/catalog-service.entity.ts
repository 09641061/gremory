import type { CatalogServiceId } from "../valueobjects/catalog-service-id.vo";
import type { Price } from "../valueobjects/price.vo";

export type CatalogServiceStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface CatalogServiceProps {
  id: CatalogServiceId;
  establishmentId: string;
  name: string;
  description?: string | null;
  price: Price;
  durationMinutes: number;
  categoryId?: string | null;
  preparationMinutes: number;
  cleanupMinutes: number;
  status: CatalogServiceStatus;
}

export class CatalogService {
  constructor(public readonly props: CatalogServiceProps) {}

  static create(props: CatalogServiceProps): CatalogService {
    if (!props.name || !props.name.trim()) throw new Error("Service name cannot be empty");
    if (props.description && props.description.length > 2000) {
      throw new Error("Service description exceeds 2000 characters");
    }
    if (props.durationMinutes < 1 || props.durationMinutes > 1440) {
      throw new Error("Duration must be between 1 and 1440 minutes");
    }
    return new CatalogService(props);
  }
}
