import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { CatalogServiceApiGateway } from "../../infrastructure/gateways/catalog-service-api.gateway";
import { ServiceCategoryApiGateway } from "../../infrastructure/gateways/service-category-api.gateway";
import { CatalogServiceQueryServiceImpl } from "../../application/internal/queryservices/catalog-service-query.service";
import { CatalogServiceCommandServiceImpl } from "../../application/internal/commandservices/catalog-service-command.service";
import { ServiceCategoryQueryServiceImpl } from "../../application/internal/queryservices/service-category-query.service";
import { ServiceCategoryCommandServiceImpl } from "../../application/internal/commandservices/service-category-command.service";
import { CatalogAccessPolicyService } from "../../application/internal/queryservices/catalog-access-policy.service";
import type {
  CatalogServiceApiPort,
  CatalogServiceCommandPort,
  CatalogAccessContext,
} from "../../application/ports/catalog-service-port";
import type {
  ServiceCategoryApiPort,
  ServiceCategoryCommandPort,
} from "../../application/ports/service-category-port";

/**
 * Server-only composition for the Catalog bounded context. Returns a fresh
 * set of adapters per invocation. Callers MUST NOT import gateways or
 * command/query services directly.
 */
export type ComposedCatalogAdapters = Readonly<{
  serviceGateway: CatalogServiceApiGateway;
  categoryGateway: ServiceCategoryApiGateway;
  serviceQueryService: CatalogServiceQueryServiceImpl;
  serviceCommandService: CatalogServiceCommandServiceImpl;
  categoryQueryService: ServiceCategoryQueryServiceImpl;
  categoryCommandService: ServiceCategoryCommandServiceImpl;
  accessPolicyService: CatalogAccessPolicyService;
  accessContext: CatalogAccessContext;
}>;

class CookieCatalogAccessContext implements CatalogAccessContext {
  async getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value;
  }
  async getOrganizationId(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(workspaceSelectionCookies.organizationId)?.value;
  }
}

export function composeCatalogAdapters(): ComposedCatalogAdapters {
  const access: CatalogAccessContext = new CookieCatalogAccessContext();
  const serviceGateway = new CatalogServiceApiGateway();
  const categoryGateway = new ServiceCategoryApiGateway();
  const serviceApiPort: CatalogServiceApiPort & CatalogServiceCommandPort = serviceGateway;
  const categoryApiPort: ServiceCategoryApiPort & ServiceCategoryCommandPort = categoryGateway;
  return {
    serviceGateway,
    categoryGateway,
    serviceQueryService: new CatalogServiceQueryServiceImpl(serviceApiPort, access),
    serviceCommandService: new CatalogServiceCommandServiceImpl(serviceApiPort),
    categoryQueryService: new ServiceCategoryQueryServiceImpl(categoryApiPort, access),
    categoryCommandService: new ServiceCategoryCommandServiceImpl(categoryApiPort),
    accessPolicyService: new CatalogAccessPolicyService(),
    accessContext: access,
  };
}
