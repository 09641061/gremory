import { Suspense } from "react";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { loadSchedulingMembers } from "@/contexts/scheduling/application/internal/queryservices/scheduling-members.query.service";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

interface TeamPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default function TeamPage({ searchParams }: TeamPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TeamPageContent({ searchParams }: TeamPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const establishmentId = resolveTeamEstablishmentId(query, workspace);

  if (workspace.accessPolicy?.canOpenTeam !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const establishment = getWorkspaceEstablishment(workspace, establishmentId ?? undefined);
  const canManageTeam = hasEstablishmentPermission(establishment, "workforce:manage");
  const canCreateInvitation = canManageTeam;
  const canDeleteMember = canManageTeam;
  const canDeleteInvitation = canManageTeam;
  const canReadRoles = canManageTeam;

  const teamService = createTeamQueryService(undefined, workspace.organization?.id);
  const [membersPage, currentMembership] = await Promise.all([
    establishmentId
      ? teamService.list({ organizationId: workspace.organization?.id, establishmentId, size: 100 }).catch(() => null)
      : Promise.resolve(null),
    teamService.getMyMembership(establishmentId ?? undefined).catch(() => null),
  ]);
  const members = mergeCurrentMembership(membersPage?.content ?? [], currentMembership);
  let schedulingAvailabilityError: string | null = null;
  const schedulingEmployees =
    establishmentId && workspace.organization?.id
       ? await loadSchedulingMembers(establishmentId, workspace.organization.id, true).catch((error: unknown) => {
          schedulingAvailabilityError =
            error instanceof Error ? error.message : "Unable to load scheduling availability.";
          return [];
        })
      : [];
  const availabilityByUserId = new Map(
    schedulingEmployees.map((employee) => [employee.userId, employee.availableForScheduling]),
  );
  const visibilityByUserId = new Map(
    schedulingEmployees.map((employee) => [employee.userId, employee.visibleForScheduling !== false]),
  );
  const membersWithAvailability = members.map((member) =>
    member.userId && availabilityByUserId.has(member.userId)
       ? {
           ...member,
           availableForScheduling: availabilityByUserId.get(member.userId) === true,
           visibleForScheduling: visibilityByUserId.get(member.userId) !== false,
         }
      : member,
  );
  return (
    <TeamPageView
      establishmentId={establishmentId ?? null}
      members={membersWithAvailability}
      canManageRoles={canReadRoles}
      canInviteMembers={canCreateInvitation}
      canRemoveMembers={canDeleteMember}
      canCancelInvitations={canDeleteInvitation}
      currentUserId={currentMembership?.userId ?? null}
      currentUserIsOwner={workspace.authorization?.role === "OWNER"}
      canManageOwnAvailability={hasEstablishmentPermission(
        getWorkspaceEstablishment(workspace, establishmentId ?? undefined),
        "availability:manage_self",
      )}
       canManageOtherAvailability={hasEstablishmentPermission(
        getWorkspaceEstablishment(workspace, establishmentId ?? undefined),
        "availability:manage_all",
       )}
       canManageScheduling={hasEstablishmentPermission(
         getWorkspaceEstablishment(workspace, establishmentId ?? undefined),
         "scheduling:manage",
       )}
      availabilityError={schedulingAvailabilityError}
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
