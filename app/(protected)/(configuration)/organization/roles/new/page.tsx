import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { composeWorkforceAdapters } from "@/contexts/workforce/interfaces/server/workforce-composition";
import { WorkforceRoleEditor } from "@/contexts/workforce/interfaces/components/workforce-role-editor";

export default function NewRolePage() { return <Suspense fallback={<PageLoading />}><NewRoleContent /></Suspense>; }
async function NewRoleContent() {
  const accessToken = await requireBusinessAccessToken();
  const workspace = await composeBusinessAdapters(accessToken).workspaceQueryService.getHeaderViewModel();
  const organization = workspace.organization;
  if (!organization || organization.id !== workspace.ownedOrganizationId) redirect("/access-denied");
  const permissions = await composeWorkforceAdapters().workforceService.listPermissions(accessToken, organization.id);
  return <PageShell><PageHeader title="Nuevo rol" description="Combina permisos del catálogo de Takodu y define su alcance." /><WorkforceRoleEditor organizationId={organization.id} permissions={permissions} /></PageShell>;
}
