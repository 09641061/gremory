import "server-only";

import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import type { SchedulingServiceViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingServices(
  establishmentId: string,
  organizationId: string,
): Promise<SchedulingServiceViewModel[]> {
  try {
    const serviceQueryService = createCatalogServiceQueryService(organizationId);
    const servicesPage = await serviceQueryService.search({ establishmentId, page: 0, size: 100 });

    return servicesPage.content.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
    }));
  } catch (error) {
    console.error("Failed to load services for scheduler:", error);
    return [];
  }
}
