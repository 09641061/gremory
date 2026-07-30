import "server-only";

import type { CatalogService } from "../../../domain/model/entities/catalog-service.entity";
import type {
  CatalogServiceQueryService,
  CatalogServiceSearchParams,
  PageResponse,
} from "../../../domain/services/catalog-service.services";
import { CatalogServiceApiGateway } from "../../../infrastructure/gateways/catalog-service-api.gateway";

export class CatalogServiceQueryServiceImpl implements CatalogServiceQueryService {
  constructor(private readonly gateway: CatalogServiceApiGateway) {}

  search(params: CatalogServiceSearchParams, token?: string): Promise<PageResponse<CatalogService>> {
    return this.gateway.search(params, token);
  }

  getById(id: string, establishmentId: string, token?: string): Promise<CatalogService> {
    return this.gateway.getById(id, establishmentId, token);
  }
}

export function createCatalogServiceQueryService() {
  return new CatalogServiceQueryServiceImpl(new CatalogServiceApiGateway());
}
