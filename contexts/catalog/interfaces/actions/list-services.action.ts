"use server";

import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";

export async function listServicesAction(establishmentId: string): Promise<DetailedServiceDTO[]> {
  try {
    const service = createCatalogServiceQueryService();
    const result = await service.search({ establishmentId, page: 0, size: 100 });
    return result.content;
  } catch (error) {
    console.error("Failed to fetch catalog services:", error);
    return [];
  }
}
