import type { PageResponse } from "@/contexts/shared/domain/model/page-response";
import type { CategoryDTO } from "../../domain/model/view-models";
import type { ServiceCategory } from "../../domain/model/entities/service-category.entity";
import type {
  CreateServiceCategoryCommand,
  DeleteServiceCategoryCommand,
  UpdateServiceCategoryCommand,
} from "../../domain/model/commands/service-category.commands";

/**
 * Server-only port for the service-category backend. Implementation lives
 * in Infrastructure and is injected via composition.
 */
export interface ServiceCategoryApiPort {
  list(
    establishmentId: string,
    page: number | undefined,
    size: number | undefined,
    token: string | undefined,
  ): Promise<PageResponse<CategoryDTO>>;
  getById(
    id: string,
    establishmentId: string,
    token: string | undefined,
  ): Promise<CategoryDTO | null>;
}

/**
 * Server-only port for the service-category mutations. Implementation lives
 * in Infrastructure and is injected via composition.
 */
export interface ServiceCategoryCommandPort {
  create(command: CreateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  update(command: UpdateServiceCategoryCommand, token?: string): Promise<ServiceCategory>;
  delete(command: DeleteServiceCategoryCommand, token?: string): Promise<void>;
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

/**
 * Application-owned category read model (typed).
 */
export type ServiceCategoryReadModel = CategoryDTO;
