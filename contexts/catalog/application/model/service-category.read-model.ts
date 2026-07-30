import type { ServiceCategory } from "../../domain/model/entities/service-category.entity";
import type { CategoryDTO } from "./catalog-view.models";

export function createServiceCategoryReadModel(category: ServiceCategory): CategoryDTO {
  return {
    id: category.props.id.value,
    establishmentId: category.props.establishmentId,
    name: category.props.name,
  };
}
