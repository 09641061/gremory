import type {
  ServiceCategoryCommandService,
} from "../../../domain/services/service-category.services";
import type { ServiceCategory } from "../../../domain/model/entities/service-category.entity";
import type {
  CreateServiceCategoryCommand,
  UpdateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
} from "../../../domain/model/commands/service-category.commands";

import type { CategoryDTO } from "../../../domain/model/view-models";

export class ServiceCategoryCommandServiceImpl implements ServiceCategoryCommandService {
  constructor(
    private readonly gateway: ServiceCategoryCommandPort,
  ) {}

  create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    return this.gateway.create(command, token);
  }

  update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory> {
    return this.gateway.update(command, token);
  }

  delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void> {
    return this.gateway.delete(command, token);
  }

  reorder(establishmentId: string, categoryIds: string[], token?: string): Promise<CategoryDTO[]> {
    return this.gateway.reorder(establishmentId, categoryIds, token);
  }
}

/**
 * Server-only port for the service-category mutations. Implementation lives
 * in Infrastructure and is injected via composition.
 */
export interface ServiceCategoryCommandPort {
  create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void>;
  reorder(establishmentId: string, categoryIds: string[], token?: string): Promise<CategoryDTO[]>;
}

export function createServiceCategoryCommandService(
  gateway: ServiceCategoryCommandPort,
): ServiceCategoryCommandService {
  return new ServiceCategoryCommandServiceImpl(gateway);
}
