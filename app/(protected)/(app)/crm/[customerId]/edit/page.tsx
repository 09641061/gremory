import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createCrmQueryService } from "@/contexts/crm/application/internal/queryservices/crm-query.service";
import type { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { EditCustomerForm } from "@/contexts/crm/interfaces/components/customer-management/edit-customer-form";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

interface EditCustomerPageProps {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ establishmentId?: string }>;
}

export default function EditCustomerPage({ params, searchParams }: EditCustomerPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditCustomerPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditCustomerPageContent({ params, searchParams }: EditCustomerPageProps) {
  const [{ customerId }, query] = await Promise.all([params, searchParams]);
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  if (workspace.accessPolicy?.canOpenCrm !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }
  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  const canUpdateCustomer = hasEstablishmentPermission(
    getWorkspaceEstablishment(workspace, establishmentId),
    "crm:manage",
  );
  if (!canUpdateCustomer || !establishmentId) {
    redirect("/access-denied");
  }

  let customer: CustomerResponse;
  try {
    customer = await createCrmQueryService(workspace.organization?.id).getCustomer(
      customerId,
      establishmentId,
    );
  } catch {
    redirect("/crm");
  }

  return <EditCustomerForm customer={customer} />;
}
