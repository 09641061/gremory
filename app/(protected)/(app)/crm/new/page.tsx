import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { CreateCustomerForm } from "@/contexts/crm/interfaces/components/customer-registration/create-customer-form";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface NewCustomerPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function NewCustomerPage({ searchParams }: NewCustomerPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const { establishmentId: paramEstId } = query;

  const policyService = createCrmAccessPolicyService();
  const establishmentId = paramEstId ?? workspace.activeEstablishmentId;

  const { canCreateCustomer } = await policyService.getPermissions(establishmentId);

  if (!canCreateCustomer || !establishmentId) {
    redirect("/access-denied");
  }

  return (
    <CreateCustomerForm
      establishmentId={establishmentId}
    />
  );
}
