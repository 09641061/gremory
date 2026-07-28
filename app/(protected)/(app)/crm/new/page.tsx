import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { CreateCustomerForm } from "@/contexts/crm/interfaces/components/create-customer-form";

export default async function NewCustomerPage() {
  const aclService = createBusinessEstablishmentAclService();
  const establishmentId = await aclService.getActiveEstablishmentIdForUser();

  return (
    <CreateCustomerForm
      establishmentId={establishmentId || ""}
    />
  );
}
