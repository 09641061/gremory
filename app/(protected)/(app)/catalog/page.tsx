import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createServiceCategoryQueryService } from "@/contexts/catalog/application/internal/queryservices/service-category-query.service";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CatalogClientWrapper } from "@/contexts/catalog/interfaces/components/catalog/catalog-client-wrapper";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";

interface CatalogPageProps {
  searchParams: Promise<{ establishmentId?: string; serviceId?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { establishmentId: paramEstId, serviceId: paramServiceId } = await searchParams;

  const aclService = createBusinessEstablishmentAclService();
  let defaultEstId = await aclService.getActiveEstablishmentIdForUser();
  if (!defaultEstId) {
    try {
      const access = await createTeamQueryService().getAccessContext();
      const allowedEst = access.establishments.find((item) =>
        item.effectivePermissions.some(
          (perm) =>
            perm === "catalog:access" ||
            perm === "catalog:services:read" ||
            perm === "catalog:categories:read" ||
            perm === "catalog:manage",
        ),
      );
      if (allowedEst) {
        defaultEstId = allowedEst.establishmentId;
      }
    } catch {
      // Ignored, will be handled by redirect if establishmentId remains undefined
    }
  }
  const establishmentId = paramEstId ?? defaultEstId ?? undefined;

  let canReadCatalog = true;
  let canCreateCategory = true;
  let canUpdateCategory = true;
  let canDeleteCategory = true;
  let canCreateService = true;
  let canUpdateService = true;
  let canDeleteService = true;

  if (establishmentId) {
    try {
      await createOrganizationQueryService().getMyOrganization();
    } catch {
      canReadCatalog = false;
      canCreateCategory = false;
      canUpdateCategory = false;
      canDeleteCategory = false;
      canCreateService = false;
      canUpdateService = false;
      canDeleteService = false;

      try {
        const access = await createTeamQueryService().getAccessContext();
        canReadCatalog = access.establishments.some(
          (item) =>
            item.establishmentId === establishmentId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "catalog:access" ||
                perm === "catalog:services:read" ||
                perm === "catalog:categories:read" ||
                perm === "catalog:manage",
            ),
        );
        canCreateCategory = access.establishments.some(
          (item) =>
            item.establishmentId === establishmentId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "catalog:categories:create" ||
                perm === "catalog:categories:manage" ||
                perm === "catalog:manage",
            ),
        );
        canUpdateCategory = access.establishments.some(
          (item) =>
            item.establishmentId === establishmentId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "catalog:categories:update" ||
                perm === "catalog:categories:manage" ||
                perm === "catalog:manage",
            ),
        );
        canDeleteCategory = access.establishments.some(
          (item) =>
            item.establishmentId === establishmentId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "catalog:categories:delete" ||
                perm === "catalog:categories:manage" ||
                perm === "catalog:manage",
            ),
        );
        canCreateService = access.establishments.some(
          (item) =>
            item.establishmentId === establishmentId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "catalog:services:create" ||
                perm === "catalog:services:manage" ||
                perm === "catalog:manage",
            ),
        );
        canUpdateService = access.establishments.some(
          (item) =>
            item.establishmentId === establishmentId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "catalog:services:update" ||
                perm === "catalog:services:manage" ||
                perm === "catalog:manage",
            ),
        );
        canDeleteService = access.establishments.some(
          (item) =>
            item.establishmentId === establishmentId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "catalog:services:delete" ||
                perm === "catalog:services:manage" ||
                perm === "catalog:manage",
            ),
        );
      } catch {
        // Handled below by redirecting
      }
    }
  } else {
    // If no active establishment, user cannot view catalog
    canReadCatalog = false;
  }

  if (!canReadCatalog) {
    const headersList = await headers();
    const referer = headersList.get("referer");
    let redirectUrl = "/chat";
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        redirectUrl = refererUrl.pathname;
      } catch {}
    }
    redirect(`${redirectUrl}?denied=catalog`);
  }

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
