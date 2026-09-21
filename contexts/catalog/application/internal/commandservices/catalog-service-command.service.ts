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

/**
 * Server-only port for the catalog-service mutations. Implementation lives
 * in Infrastructure and is injected via composition.
 */
export interface CatalogServiceCommandPort {
  create(command: CreateCatalogServiceCommand, token?: string): Promise<CatalogService>;
  update(command: UpdateCatalogServiceCommand, token?: string): Promise<CatalogService>;
  changeStatus(command: ChangeCatalogServiceStatusCommand, token?: string): Promise<void>;
  delete(command: DeleteCatalogServiceCommand, token?: string): Promise<void>;
}

export class CatalogServiceCommandServiceImpl implements CatalogServiceCommandService {
  constructor(private readonly gateway: CatalogServiceCommandPort) {}

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

export function createCatalogServiceCommandService(
  gateway: CatalogServiceCommandPort,
): CatalogServiceCommandService {
  return new CatalogServiceCommandServiceImpl(gateway);
}
