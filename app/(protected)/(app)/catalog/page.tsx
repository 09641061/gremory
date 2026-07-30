import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createServiceCategoryQueryService } from "@/contexts/catalog/application/internal/queryservices/service-category-query.service";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CatalogClientWrapper } from "@/contexts/catalog/interfaces/components/catalog/catalog-client-wrapper";

interface CatalogPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { establishmentId: paramEstId } = await searchParams;

  const aclService = createBusinessEstablishmentAclService();
  const defaultEstId = await aclService.getActiveEstablishmentIdForUser();
  const establishmentId = paramEstId ?? defaultEstId ?? undefined;

  let categories: CategoryDTO[] = [];
  let services: DetailedServiceDTO[] = [];

  if (establishmentId) {
    try {
      const categoryQueryService = createServiceCategoryQueryService();
      const categoriesPage = await categoryQueryService.list(establishmentId, 0, 100);
      categories = categoriesPage.content;

      const serviceQueryService = createCatalogServiceQueryService();
      const servicesPage = await serviceQueryService.search({ establishmentId, page: 0, size: 100 });
      services = servicesPage.content;
    } catch {
      // Fallback arrays remain empty on fetch failure
    }
  }

  return (
    <CatalogClientWrapper
      initialEstablishmentId={establishmentId}
      initialCategories={categories}
      initialServices={services}
    />
  );
}
