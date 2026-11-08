import type { CatalogServiceSearchParams } from "../../domain/services/catalog-service.services";
import type { PageResponse } from "@/contexts/shared/domain/model/page-response";
import type { DetailedServiceDTO } from "../../domain/model/view-models";
import type { CatalogService } from "../../domain/model/entities/catalog-service.entity";
import type {
  ChangeCatalogServiceStatusCommand,
  CreateCatalogServiceCommand,
  DeleteCatalogServiceCommand,
  UpdateCatalogServiceCommand,
} from "../../domain/model/commands/catalog-service.commands";

/**
 * Server-only port for the catalog-service backend. Implementation lives
 * in Infrastructure and is injected via composition.
 */
export interface CatalogServiceApiPort {
  search(
    params: CatalogServiceSearchParams,
    token: string | undefined,
  ): Promise<PageResponse<DetailedServiceDTO>>;
  getById(
    id: string,
    establishmentId: string,
    token: string | undefined,
  ): Promise<DetailedServiceDTO>;
}

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

/**
 * Server-only port for resolving the access token + tenant id from the
 * request scope. Hides cookie and `next/headers` access from the
 * Application layer.
 */
export interface CatalogAccessContext {
  getAccessToken(): Promise<string | undefined>;
  getOrganizationId(): Promise<string | undefined>;
}
