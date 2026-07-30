import "server-only";

import type { ServiceCategory } from "../../../domain/model/entities/service-category.entity";
import type { PageResponse } from "../../../domain/services/catalog-service.services";
import type { ServiceCategoryQueryService } from "../../../domain/services/service-category.services";
import { ServiceCategoryApiGateway } from "../../../infrastructure/gateways/service-category-api.gateway";

export class ServiceCategoryQueryServiceImpl implements ServiceCategoryQueryService {
  constructor(private readonly gateway: ServiceCategoryApiGateway) {}

  list(
    establishmentId: string,
    page?: number,
    size?: number,
    token?: string
  ): Promise<PageResponse<ServiceCategory>> {
    return this.gateway.list(establishmentId, page, size, token);
  }
}

export function createServiceCategoryQueryService() {
  return new ServiceCategoryQueryServiceImpl(new ServiceCategoryApiGateway());
}
