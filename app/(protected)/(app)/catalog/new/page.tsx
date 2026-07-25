import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { CreateServiceForm } from "@/contexts/catalog/interfaces/components/create-service-form";

interface NewCatalogServicePageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function NewCatalogServicePage({ searchParams }: NewCatalogServicePageProps) {
  const { categoryId } = await searchParams;

  const aclService = createBusinessEstablishmentAclService();
  const establishmentId = await aclService.getActiveEstablishmentIdForUser();

  return (
    <CreateServiceForm
      establishmentId={establishmentId ?? ""}
      categoryId={categoryId}
    />
  );
}
