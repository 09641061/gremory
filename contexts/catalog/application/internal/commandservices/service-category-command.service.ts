import "server-only";

import type {
  ServiceCategoryCommandService,
  ServiceCategoryQueryService,
} from "../../../domain/services/service-category.services";
import type { ServiceCategory } from "../../../domain/model/entities/service-category.entity";
import type {
  CreateServiceCategoryCommand,
  UpdateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
} from "../../../domain/model/commands/service-category.commands";
import type { PageResponse } from "../../../domain/services/catalog-service.services";
import { ServiceCategoryApiGateway } from "../../../infrastructure/gateways/service-category-api.gateway";

export class ServiceCategoryCommandServiceImpl implements ServiceCategoryCommandService {
  constructor(private readonly gateway: ServiceCategoryApiGateway) {}

  create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    return this.gateway.create(command, token);
  }

  update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    return this.gateway.update(command, token);
  }

  delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void> {
    return this.gateway.delete(command, token);
  }
}

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

export function createServiceCategoryCommandService() {
  return new ServiceCategoryCommandServiceImpl(new ServiceCategoryApiGateway());
}

export function createServiceCategoryQueryService() {
  return new ServiceCategoryQueryServiceImpl(new ServiceCategoryApiGateway());
}
