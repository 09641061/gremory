import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";
import { createWorkforceAccessPolicyService } from "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface TeamPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const establishmentId = resolveTeamEstablishmentId(query, workspace);

  const policyService = createWorkforceAccessPolicyService();

  const {
    canReadTeam,
    canDeleteMember,
    canCreateInvitation,
    canDeleteInvitation,
    canReadRoles,
  } = await policyService.getPermissions(establishmentId ?? undefined);

  if (!canReadTeam) {
    redirect("/access-denied");
  }

  const teamService = createTeamQueryService();
  const [membersPage, currentMembership] = await Promise.all([
    establishmentId
      ? teamService.list({ establishmentId, size: 100 })
      : Promise.resolve(null),
    teamService.getMyMembership(establishmentId ?? undefined),
  ]);
  const members = mergeCurrentMembership(membersPage?.content ?? [], currentMembership);

  return (
    <TeamPageView
      establishmentId={establishmentId ?? null}
      members={members}
      canManageRoles={canReadRoles}
      canInviteMembers={canCreateInvitation}
      canRemoveMembers={canDeleteMember}
      canCancelInvitations={canDeleteInvitation}
      currentUserId={currentMembership?.userId ?? null}
    />
  );
}

function resolveTeamEstablishmentId(
  query: Awaited<TeamPageProps["searchParams"]>,
  workspace: Awaited<ReturnType<ReturnType<typeof createBusinessWorkspaceQueryService>["getHeaderViewModel"]>>,
) {
  if (query.establishmentId) return query.establishmentId;

  if (query.organizationId) {
    const establishmentInOrganization = workspace.establishments.find(
      (establishment) => establishment.organizationId === query.organizationId,
    );
    if (establishmentInOrganization) {
      return establishmentInOrganization.id;
    }
  }

  return workspace.activeEstablishmentId ?? null;
}

function mergeCurrentMembership(
  members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"],
  currentMembership: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["getMyMembership"]>>,
) {
  if (!currentMembership) return members;

  const currentUserId = currentMembership.userId;
  const currentMemberId = currentMembership.memberId;
  const existingIndex = members.findIndex((member) => {
    if (currentMemberId && member.memberId === currentMemberId) return true;
    if (currentUserId && member.userId === currentUserId) return true;
    return false;
  });

  if (existingIndex < 0) {
    return members;
  }

  const next = [...members];
  next[existingIndex] = currentMembership;
  return next;
}
