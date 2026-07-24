import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/commandservices/catalog-service-command.service";
import { EditServiceForm } from "@/contexts/catalog/interfaces/components/edit-service-form";
import type { DetailedServiceDTO } from "@/contexts/catalog/interfaces/components/service-detail-view";

export const revalidate = 0;

interface EditCatalogServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCatalogServicePage({ params }: EditCatalogServicePageProps) {
  const { id } = await params;

  const aclService = createBusinessEstablishmentAclService();
  const establishmentId = await aclService.getActiveEstablishmentIdForUser();

  let service: DetailedServiceDTO | null = null;

  if (establishmentId) {
    try {
      const serviceQueryService = createCatalogServiceQueryService();
      const catalogService = await serviceQueryService.getById(id, establishmentId);
      service = {
        id: catalogService.props.id.value,
        name: catalogService.props.name,
        description: catalogService.props.description,
        price: catalogService.props.price.amount,
        durationMinutes: catalogService.props.durationMinutes,
        preparationMinutes: catalogService.props.preparationMinutes,
        cleanupMinutes: catalogService.props.cleanupMinutes,
        categoryId: catalogService.props.categoryId,
        preServiceInstructions: catalogService.props.preServiceInstructions,
        postServiceRecommendations: catalogService.props.postServiceRecommendations,
        status: catalogService.props.status,
      };
    } catch {
      service = null;
    }
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Service not found or failed to load.
      </div>
    );
  }

  return <EditServiceForm service={service} />;
}
