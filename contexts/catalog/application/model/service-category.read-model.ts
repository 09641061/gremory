import type { ServiceCategory } from "../../domain/model/entities/service-category.entity";
import type { CategoryDTO } from "../../domain/model/view-models";

/**
 * Read-model adapter. Application-layer consumers receive `CategoryDTO`
 * directly from the gateway; this helper remains for callers that still hold
 * an entity reference (e.g. command paths).
 */
export function createServiceCategoryReadModel(category: ServiceCategory): CategoryDTO {
  return {
    id: category.props.id.value,
    establishmentId: category.props.establishmentId,
    name: category.props.name,
  };
}
