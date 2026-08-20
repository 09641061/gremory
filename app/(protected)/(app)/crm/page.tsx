import { Suspense } from "react";
import { getCrmPageData } from "@/contexts/crm/application/internal/queryservices/crm-page-data.service";
import { CrmClientWrapper } from "@/contexts/crm/interfaces/components/customer-directory/crm-client-wrapper";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import type { CrmPermissions } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

interface CrmPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    size?: string;
    organizationId?: string;
    establishmentId?: string;
  }>;
}

export default function CrmPage({ searchParams }: CrmPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CrmPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CrmPageContent({ searchParams }: CrmPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = params.page ? parseInt(params.page, 10) : 0;
  const size = params.size ? parseInt(params.size, 10) : 20;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(params);
  const establishmentId = params.establishmentId ?? workspace.activeEstablishmentId;

  if (workspace.accessPolicy?.canOpenCrm !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const workspaceEstablishment = getWorkspaceEstablishment(workspace, establishmentId);
  const canManageCrm = hasEstablishmentPermission(workspaceEstablishment, "crm:manage");
  const permissions: CrmPermissions = {
    canReadCustomers: true,
    canCreateCustomer: canManageCrm,
    canUpdateCustomer: canManageCrm,
    canDeleteCustomer: canManageCrm,
  };

  const { establishmentId: resolvedEstablishmentId, permissions: pagePermissions, customersPage, searchFailed } = await getCrmPageData(
    establishmentId,
    workspace.organization?.id,
    search,
    page,
    size,
    permissions,
  );

  return (
    <CrmClientWrapper
      initialCustomers={customersPage}
       establishmentId={resolvedEstablishmentId}
       canCreateCustomer={pagePermissions.canCreateCustomer}
       canUpdateCustomer={pagePermissions.canUpdateCustomer}
       canDeleteCustomer={pagePermissions.canDeleteCustomer}
      loadError={searchFailed}
    />
  );
}
