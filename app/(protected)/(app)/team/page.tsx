import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";
import { createWorkforceAccessPolicyService } from "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface TeamPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  const policyService = createWorkforceAccessPolicyService();
  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  const {
    canReadTeam,
    canDeleteMember,
    canCreateInvitation,
    canDeleteInvitation,
    canReadRoles,
  } = await policyService.getPermissions(establishmentId);

  if (!canReadTeam) {
    redirect("/access-denied");
  }

  let members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"] = [];
  if (establishmentId) {
    members = (
      await createTeamQueryService().list({
        organizationId: workspace.organization?.id,
        establishmentId,
        size: 100,
      })
    ).content;
  }
  return (
    <TeamPageView
      establishmentId={establishmentId ?? null}
      members={members}
      canManageRoles={canReadRoles}
      canInviteMembers={canCreateInvitation}
      canRemoveMembers={canDeleteMember}
      canCancelInvitations={canDeleteInvitation}
    />
  );
}
