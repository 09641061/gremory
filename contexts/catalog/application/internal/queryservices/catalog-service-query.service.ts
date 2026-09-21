import type {
  CatalogServiceQueryService,
  CatalogServiceSearchParams,
} from "../../../domain/services/catalog-service.services";
import type { PageResponse } from "@/contexts/shared/application/model/page-response";
import type { DetailedServiceDTO } from "../../model/catalog-view.models";
import {
  type CatalogServiceApiPort,
  type CatalogAccessContext,
} from "../../ports/catalog-service-port";

export class CatalogServiceQueryServiceImpl implements CatalogServiceQueryService {
  constructor(
    private readonly gateway: CatalogServiceApiPort,
    private readonly access: CatalogAccessContext,
  ) {}

  async search(
    params: CatalogServiceSearchParams,
    token?: string,
  ): Promise<PageResponse<DetailedServiceDTO>> {
    const authToken = token ?? (await this.access.getAccessToken());
    return this.gateway.search(params, authToken);
  }

  async getById(id: string, establishmentId: string, token?: string): Promise<DetailedServiceDTO> {
    const authToken = token ?? (await this.access.getAccessToken());
    return this.gateway.getById(id, establishmentId, authToken);
  }
}

export function createCatalogServiceQueryService(
  gateway: CatalogServiceApiPort,
  access: CatalogAccessContext,
): CatalogServiceQueryService {
  return new CatalogServiceQueryServiceImpl(gateway, access);
}
