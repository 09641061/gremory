import { Suspense } from "react";
import { CreateCustomerForm } from "@/contexts/crm/interfaces/components/customer-registration/create-customer-form";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

interface NewCustomerPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default function NewCustomerPage({ searchParams }: NewCustomerPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewCustomerPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewCustomerPageContent({ searchParams }: NewCustomerPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  if (workspace.accessPolicy?.canOpenCrm !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }
  const { establishmentId: paramEstId } = query;

  const establishmentId = paramEstId ?? workspace.activeEstablishmentId;
  const canCreateCustomer = hasEstablishmentPermission(
    getWorkspaceEstablishment(workspace, establishmentId),
    "crm:manage",
  );

  if (!canCreateCustomer || !establishmentId) {
    redirect("/access-denied");
  }

  return (
    <CreateCustomerForm
      establishmentId={establishmentId}
    />
  );
}
