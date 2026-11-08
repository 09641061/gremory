"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { DetailedServiceDTO } from "@/contexts/catalog/domain/model/view-models";
import { requireCatalogContext } from "../authorization/catalog-authorization";
import { composeCatalogAdapters } from "../server/catalog-composition";

export async function listServicesAction(establishmentId: string): Promise<DetailedServiceDTO[]> {
  try {
    const auth = await requireCatalogContext("catalog:read", establishmentId);
    const adapters = composeCatalogAdapters();
    const service = createCatalogServiceQueryService(
      adapters.serviceGateway,
      adapters.serviceGateway as unknown as Parameters<typeof createCatalogServiceQueryService>[1],
    );
    const result = await service.search({ establishmentId, page: 0, size: 100 }, auth.token);
    return result.content;
  } catch (error) {
    recordSafely("catalog.list.services.action", { cause: error });
    return [];
  }
}
