import "server-only";

import type {
  CatalogServiceCommandService,
} from "../../../domain/services/catalog-service.services";
import type { CatalogService } from "../../../domain/model/entities/catalog-service.entity";
import type {
  CreateCatalogServiceCommand,
  UpdateCatalogServiceCommand,
  ChangeCatalogServiceStatusCommand,
  DeleteCatalogServiceCommand,
} from "../../../domain/model/commands/catalog-service.commands";
import { CatalogServiceApiGateway } from "../../../infrastructure/gateways/catalog-service-api.gateway";

export class CatalogServiceCommandServiceImpl implements CatalogServiceCommandService {
  constructor(private readonly gateway: CatalogServiceApiGateway) {}

  create(command: CreateCatalogServiceCommand, token?: string): Promise<CatalogService> {
    return this.gateway.create(command, token);
  }

  update(command: UpdateCatalogServiceCommand, token?: string): Promise<CatalogService> {
    return this.gateway.update(command, token);
  }

  changeStatus(command: ChangeCatalogServiceStatusCommand, token?: string): Promise<void> {
    return this.gateway.changeStatus(command, token);
  }

  delete(command: DeleteCatalogServiceCommand, token?: string): Promise<void> {
    return this.gateway.delete(command, token);
  }
}

export function createCatalogServiceCommandService(organizationId?: string) {
  return new CatalogServiceCommandServiceImpl(new CatalogServiceApiGateway(organizationId));
}
