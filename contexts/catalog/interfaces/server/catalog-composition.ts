import "server-only";

import { CatalogServiceApiGateway } from "../../infrastructure/gateways/catalog-service-api.gateway";
import { ServiceCategoryApiGateway } from "../../infrastructure/gateways/service-category-api.gateway";
import { CatalogServiceQueryServiceImpl } from "../../application/internal/queryservices/catalog-service-query.service";
import { CatalogServiceCommandServiceImpl } from "../../application/internal/commandservices/catalog-service-command.service";
import { ServiceCategoryQueryServiceImpl } from "../../application/internal/queryservices/service-category-query.service";
import { ServiceCategoryCommandServiceImpl } from "../../application/internal/commandservices/service-category-command.service";
import { CatalogAccessPolicyService } from "../../application/internal/queryservices/catalog-access-policy.service";

/**
 * Server-only composition for the Catalog bounded context.
 *
 * Composition returns a fresh set of adapters per invocation. Callers MUST NOT
 * import gateways or command/query services directly; the seams are:
 *   - application/ports/catalog-service-reader.ts (future)
 *   - application/ports/service-category-reader.ts (future)
 * Until those ports exist, this composition hands out the existing
 * services so callers stop reaching into the gateways themselves.
 */
export type ComposedCatalogAdapters = Readonly<{
  serviceGateway: CatalogServiceApiGateway;
  categoryGateway: ServiceCategoryApiGateway;
  serviceQueryService: CatalogServiceQueryServiceImpl;
  serviceCommandService: CatalogServiceCommandServiceImpl;
  categoryQueryService: ServiceCategoryQueryServiceImpl;
  categoryCommandService: ServiceCategoryCommandServiceImpl;
  accessPolicyService: CatalogAccessPolicyService;
}>;

export function composeCatalogAdapters(): ComposedCatalogAdapters {
  const serviceGateway = new CatalogServiceApiGateway();
  const categoryGateway = new ServiceCategoryApiGateway();
  return {
    serviceGateway,
    categoryGateway,
    serviceQueryService: new CatalogServiceQueryServiceImpl(),
    serviceCommandService: new CatalogServiceCommandServiceImpl(serviceGateway),
    categoryQueryService: new ServiceCategoryQueryServiceImpl(),
    categoryCommandService: new ServiceCategoryCommandServiceImpl(categoryGateway),
    accessPolicyService: new CatalogAccessPolicyService(),
  };
}
