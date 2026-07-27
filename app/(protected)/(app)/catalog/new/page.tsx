import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { CreateServiceForm } from "@/contexts/catalog/interfaces/components/create-service-form";

interface NewCatalogServicePageProps {
  searchParams: Promise<{ categoryId?: string; t?: string }>;
}

export default async function NewCatalogServicePage({ searchParams }: NewCatalogServicePageProps) {
  const { categoryId, t } = await searchParams;

  const aclService = createBusinessEstablishmentAclService();
  const establishmentId = await aclService.getActiveEstablishmentIdForUser();

  // Create a unique stable key including the client navigation timestamp parameter
  const pageKey = `new_service_${establishmentId}_${categoryId ?? "none"}_${t ?? "0"}`;

  return (
    <CreateServiceForm
      key={pageKey}
      establishmentId={establishmentId ?? ""}
      categoryId={categoryId}
    />
  );
}
