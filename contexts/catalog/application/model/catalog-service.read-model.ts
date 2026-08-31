import type { CatalogService } from "../../domain/model/entities/catalog-service.entity";
import type { DetailedServiceDTO } from "./catalog-view.models";

export function createCatalogServiceReadModel(service: CatalogService): DetailedServiceDTO {
  return {
    id: service.props.id.value,
    establishmentId: service.props.establishmentId,
    name: service.props.name,
    description: service.props.description,
    price: service.props.price.amount,
    durationMinutes: service.props.durationMinutes,
    preparationMinutes: service.props.preparationMinutes,
    cleanupMinutes: service.props.cleanupMinutes,
    categoryId: service.props.categoryId ?? null,
    preServiceInstructions: service.props.preServiceInstructions ?? null,
    postServiceRecommendations: service.props.postServiceRecommendations ?? null,
    status: service.props.status,
  };
}
