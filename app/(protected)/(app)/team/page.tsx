import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";
import { createWorkforceAccessPolicyService } from "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service";
import { redirect } from "next/navigation";

interface TeamPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const { establishmentId: paramEstId } = await searchParams;

  const policyService = createWorkforceAccessPolicyService();
  const defaultEstId = await policyService.getDefaultEstablishmentId();
  const establishmentId = paramEstId ?? defaultEstId ?? undefined;

  const {
    canReadTeam,
    canDeleteMember,
    canCreateInvitation,
    canDeleteInvitation,
    canReadRoles,
  } = await policyService.getPermissions(establishmentId);

  if (!canReadTeam) {
    redirect("/chat?denied=workforce");
  }

  let members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"] = [];
  if (establishmentId) {
    try {
      members = (await createTeamQueryService().list({ establishmentId, size: 100 })).content;
    } catch {
      // Keep the team shell available while workforce is unavailable.
    }
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
