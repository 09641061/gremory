import { redirect } from "next/navigation";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createServiceCategoryQueryService } from "@/contexts/catalog/application/internal/queryservices/service-category-query.service";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CatalogClientWrapper } from "@/contexts/catalog/interfaces/components/catalog/catalog-client-wrapper";
import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface CatalogPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string; serviceId?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const query = await searchParams;
  const { establishmentId: paramEstId, serviceId: paramServiceId } = query;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  const policyService = createCatalogAccessPolicyService();
  const establishmentId = paramEstId ?? workspace.activeEstablishmentId;

  const {
    canReadCatalog,
    canCreateCategory,
    canUpdateCategory,
    canDeleteCategory,
    canCreateService,
    canUpdateService,
    canDeleteService,
  } = await policyService.getPermissions(establishmentId);

  if (!canReadCatalog) {
    redirect("/access-denied");
  }

  let categories: CategoryDTO[] = [];
  let services: DetailedServiceDTO[] = [];

  if (establishmentId) {
    const categoryQueryService = createServiceCategoryQueryService();
    const serviceQueryService = createCatalogServiceQueryService();
    const [categoriesPage, servicesPage] = await Promise.all([
      categoryQueryService.list(establishmentId, 0, 100),
      serviceQueryService.search({ establishmentId, page: 0, size: 100 }),
    ]);
    categories = categoriesPage.content;
    services = servicesPage.content;
  }

  return (
    <CatalogClientWrapper
      initialEstablishmentId={establishmentId}
      initialSelectedServiceId={paramServiceId}
      initialCategories={categories}
      initialServices={services}
      canCreateCategory={canCreateCategory}
      canUpdateCategory={canUpdateCategory}
      canDeleteCategory={canDeleteCategory}
      canCreateService={canCreateService}
      canUpdateService={canUpdateService}
      canDeleteService={canDeleteService}
    />
  );
}
