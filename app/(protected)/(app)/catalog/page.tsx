import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/commandservices/catalog-service-command.service";
import { createServiceCategoryQueryService } from "@/contexts/catalog/application/internal/commandservices/service-category-command.service";
import { CatalogClientWrapper } from "@/contexts/catalog/interfaces/components/catalog-client-wrapper";
import type { DetailedServiceDTO } from "@/contexts/catalog/interfaces/components/service-detail-view";
import type { CategoryDTO } from "@/contexts/catalog/interfaces/components/category-sidebar";
import type { OrganizationOption } from "@/contexts/business/interfaces/components/business/establishment-selector-bar";

interface CatalogPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { establishmentId: paramEstId } = await searchParams;

  const aclService = createBusinessEstablishmentAclService();
  const defaultEstId = await aclService.getActiveEstablishmentIdForUser();
  const establishmentId = paramEstId ?? defaultEstId ?? undefined;

  // Fetch user organizations and establishments for the temporary selector bar
  let organizations: OrganizationOption[] = [];
  try {
    const orgQueryService = createOrganizationQueryService();
    const myOrg = await orgQueryService.getMyOrganization();
    
    const estQueryService = createEstablishmentQueryService();
    const estPage = await estQueryService.getByOrganization({
      organizationId: myOrg.id,
      page: 0,
      size: 50,
    });

    organizations = [
      {
        id: myOrg.id,
        name: myOrg.name,
        establishments: estPage.content.map((e) => ({
          id: e.id,
          name: e.name,
        })),
      },
    ];
  } catch {
    organizations = [];
  }

  let categories: CategoryDTO[] = [];
  let services: DetailedServiceDTO[] = [];

  if (establishmentId) {
    try {
      const categoryQueryService = createServiceCategoryQueryService();
      const categoriesPage = await categoryQueryService.list(establishmentId, 0, 100);
      categories = categoriesPage.content.map((c) => ({
        id: c.props.id.value,
        name: c.props.name,
      }));

      const serviceQueryService = createCatalogServiceQueryService();
      const servicesPage = await serviceQueryService.search({ establishmentId, page: 0, size: 100 });
      services = servicesPage.content.map((s) => ({
        id: s.props.id.value,
        name: s.props.name,
        description: s.props.description,
        price: s.props.price.amount,
        durationMinutes: s.props.durationMinutes,
        preparationMinutes: s.props.preparationMinutes,
        cleanupMinutes: s.props.cleanupMinutes,
        categoryId: s.props.categoryId,
        preServiceInstructions: s.props.preServiceInstructions,
        postServiceRecommendations: s.props.postServiceRecommendations,
        status: s.props.status,
      }));
    } catch {
      // Fallback arrays remain empty on fetch failure
    }
  }

  return (
    <CatalogClientWrapper
      initialEstablishmentId={establishmentId}
      organizations={organizations}
      initialCategories={categories}
      initialServices={services}
    />
  );
}
