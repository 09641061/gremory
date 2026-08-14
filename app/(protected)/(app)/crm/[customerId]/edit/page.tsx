import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { createCrmQueryService } from "@/contexts/crm/application/internal/queryservices/crm-query.service";
import type { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { EditCustomerForm } from "@/contexts/crm/interfaces/components/customer-management/edit-customer-form";

interface EditCustomerPageProps {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function EditCustomerPage({ params, searchParams }: EditCustomerPageProps) {
  const [{ customerId }, query] = await Promise.all([params, searchParams]);
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  const permissions = await createCrmAccessPolicyService().getPermissions(establishmentId);
  if (!permissions.canUpdateCustomer || !establishmentId) {
    redirect("/access-denied");
  }

  let customer: CustomerResponse;
  try {
    customer = await createCrmQueryService().getCustomer(customerId, establishmentId);
  } catch {
    redirect("/crm");
  }

  return <EditCustomerForm customer={customer} />;
}
