import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { RoleManagement } from "@/contexts/workforce/interfaces/components/role-management";
import { WorkspaceAuthProvider } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string }>;
}) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query).catch(() => null);

  return (
    <WorkspaceAuthProvider authorization={workspace?.workforceAuthorization}>
      <RoleManagement />
    </WorkspaceAuthProvider>
  );
}
