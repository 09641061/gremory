import { Suspense } from "react";
import { getCrmPageData } from "@/contexts/crm/application/internal/queryservices/crm-page-data.service";
import { createCrmQueryService } from "@/contexts/crm/interfaces/server/crm-composition";
import { CrmClientWrapper } from "@/contexts/crm/interfaces/components/customer-directory/crm-client-wrapper";
import { redirect } from "next/navigation";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import type { CrmPermissions } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";

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
  const requestedPage = params.page ? Number(params.page) : 0;
  const requestedSize = params.size ? Number(params.size) : 20;
  const page = Number.isInteger(requestedPage) && requestedPage >= 0 ? Math.min(requestedPage, 10_000) : 0;
  const size = Number.isInteger(requestedSize) && requestedSize > 0 ? Math.min(requestedSize, 100) : 20;
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel(params);
  const establishmentId = params.establishmentId ?? workspace.activeEstablishmentId;

  if (workspace.accessPolicy?.canOpenCrm !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const workspaceEstablishment = getWorkspaceEstablishment(workspace, establishmentId);
  const canReadCrm = hasEstablishmentPermission(workspaceEstablishment, "crm:read");
  const canManageCrm = hasEstablishmentPermission(workspaceEstablishment, "crm:manage");
  const permissions: CrmPermissions = {
    canReadCustomers: canReadCrm,
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
    createCrmQueryService(workspace.organization?.id),
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
