import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { CreateCustomerForm } from "@/contexts/crm/interfaces/components/create-customer-form";
import { redirect } from "next/navigation";

interface NewCustomerPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function NewCustomerPage({ searchParams }: NewCustomerPageProps) {
  const { establishmentId: paramEstId } = await searchParams;

  const policyService = createCrmAccessPolicyService();
  const defaultEstId = await policyService.getDefaultEstablishmentId();
  const establishmentId = paramEstId ?? defaultEstId;

  const { canCreateCustomer } = await policyService.getPermissions(establishmentId);

  if (!canCreateCustomer) {
    redirect("/crm?denied=create");
  }

  return (
    <CreateCustomerForm
      establishmentId={establishmentId || ""}
    />
  );
}
