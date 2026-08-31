import type { CategoryId } from "../valueobjects/category-id.vo";

export interface ServiceCategoryProps {
  id: CategoryId;
  establishmentId: string;
  name: string;
}

export class ServiceCategory {
  constructor(public readonly props: ServiceCategoryProps) {}

  static create(props: ServiceCategoryProps): ServiceCategory {
    if (!props.name.trim()) throw new Error("Category name cannot be empty");
    return new ServiceCategory(props);
  }
}
