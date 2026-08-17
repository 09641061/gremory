import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";

interface TeamPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const establishmentId = resolveTeamEstablishmentId(query, workspace);

  if (workspace.accessPolicy?.canOpenTeam !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const establishment = getWorkspaceEstablishment(workspace, establishmentId ?? undefined);
  const canManageTeam = hasEstablishmentPermission(establishment, "workforce:manage") ||
    hasEstablishmentPermission(establishment, "workforce:manage_members");
  const canCreateInvitation = hasEstablishmentPermission(establishment, "workforce:invite") || canManageTeam;
  const canDeleteMember = canManageTeam;
  const canDeleteInvitation = canManageTeam;
  const canReadRoles = hasEstablishmentPermission(establishment, "workforce:manage_roles") || canManageTeam;

  const teamService = createTeamQueryService();
  const [membersPage, currentMembership] = await Promise.all([
    establishmentId
      ? teamService.list({ establishmentId, size: 100 }).catch(() => null)
      : Promise.resolve(null),
    teamService.getMyMembership(establishmentId ?? undefined).catch(() => null),
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
    return currentMembership.status === "ACTIVE" ? [...members, currentMembership] : members;
  }

  const next = [...members];
  next[existingIndex] = currentMembership;
  return next;
}
