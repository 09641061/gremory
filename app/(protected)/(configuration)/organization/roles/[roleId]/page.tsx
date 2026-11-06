import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { composeWorkforceAdapters } from "@/contexts/workforce/interfaces/server/workforce-composition";
import { WorkforceRoleEditor } from "@/contexts/workforce/interfaces/components/workforce-role-editor";

export default function EditRolePage(props: PageProps<"/organization/roles/[roleId]">) { return <Suspense fallback={<PageLoading />}><EditRoleContent params={props.params} /></Suspense>; }
async function EditRoleContent({ params }: Pick<PageProps<"/organization/roles/[roleId]">, "params">) {
  const { roleId } = await params;
  const accessToken = await requireBusinessAccessToken();
  const workspace = await composeBusinessAdapters(accessToken).workspaceQueryService.getHeaderViewModel();
  const organization = workspace.organization;
  if (!organization || organization.id !== workspace.ownedOrganizationId) redirect("/access-denied");
  const service = composeWorkforceAdapters().workforceService;
  const [permissions, role] = await Promise.all([service.listPermissions(accessToken, organization.id), service.getRole(accessToken, organization.id, roleId)]);
  return <PageShell><PageHeader title={`Editar ${role.name}`} description={`${role.activeMemberCount} persona${role.activeMemberCount === 1 ? "" : "s"} recibirá${role.activeMemberCount === 1 ? "" : "n"} los cambios desde su siguiente petición.`} /><WorkforceRoleEditor organizationId={organization.id} permissions={permissions} role={role} /></PageShell>;
}
