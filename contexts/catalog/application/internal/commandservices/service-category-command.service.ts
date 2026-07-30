import "server-only";

import type {
  ServiceCategoryCommandService,
} from "../../../domain/services/service-category.services";
import type { ServiceCategory } from "../../../domain/model/entities/service-category.entity";
import type {
  CreateServiceCategoryCommand,
  UpdateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
} from "../../../domain/model/commands/service-category.commands";
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

export function createServiceCategoryCommandService() {
  return new ServiceCategoryCommandServiceImpl(new ServiceCategoryApiGateway());
}
