import type { ServiceCategoryQueryService } from "../../../domain/services/service-category.services";
import type { PageResponse } from "@/contexts/shared/application/model/page-response";
import type { CategoryDTO } from "../../model/catalog-view.models";
import {
  type ServiceCategoryApiPort,
  type CatalogAccessContext,
} from "../../ports/service-category-port";

export class ServiceCategoryQueryServiceImpl implements ServiceCategoryQueryService {
  constructor(
    private readonly gateway: ServiceCategoryApiPort,
    private readonly access: CatalogAccessContext,
  ) {}

  async list(
    establishmentId: string,
    page?: number,
    size?: number,
    token?: string,
  ): Promise<PageResponse<CategoryDTO>> {
    const authToken = token ?? (await this.access.getAccessToken());
    return this.gateway.list(establishmentId, page, size, authToken);
  }

  async getById(
    id: string,
    establishmentId: string,
    token?: string,
  ): Promise<CategoryDTO | null> {
    const authToken = token ?? (await this.access.getAccessToken());
    return this.gateway.getById(id, establishmentId, authToken);
  }
}

export function createServiceCategoryQueryService(
  gateway: ServiceCategoryApiPort,
  access: CatalogAccessContext,
): ServiceCategoryQueryService {
  return new ServiceCategoryQueryServiceImpl(gateway, access);
}
