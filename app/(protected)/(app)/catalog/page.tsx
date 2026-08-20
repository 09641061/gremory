import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createServiceCategoryQueryService } from "@/contexts/catalog/application/internal/queryservices/service-category-query.service";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CatalogClientWrapper } from "@/contexts/catalog/interfaces/components/catalog/catalog-client-wrapper";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

interface CatalogPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string; serviceId?: string }>;
}

export default function CatalogPage({ searchParams }: CatalogPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CatalogPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CatalogPageContent({ searchParams }: CatalogPageProps) {
  const query = await searchParams;
  const { establishmentId: paramEstId, serviceId: paramServiceId } = query;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  if (workspace.accessPolicy?.canOpenCatalog !== true || !workspace.organization) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const establishmentId = paramEstId ?? workspace.activeEstablishmentId;
  const establishment = getWorkspaceEstablishment(workspace, establishmentId);
  const canManageCatalog = hasEstablishmentPermission(establishment, "catalog:manage");
  const canCreateCategory = canManageCatalog;
  const canUpdateCategory = canManageCatalog;
  const canDeleteCategory = canManageCatalog;
  const canCreateService = canManageCatalog;
  const canUpdateService = canManageCatalog;
  const canDeleteService = canManageCatalog;

  let categories: CategoryDTO[] = [];
  let services: DetailedServiceDTO[] = [];

  if (establishmentId) {
    const categoryQueryService = createServiceCategoryQueryService(workspace.organization.id);
    const serviceQueryService = createCatalogServiceQueryService(workspace.organization.id);
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
