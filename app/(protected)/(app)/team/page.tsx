import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamPageView } from "@/contexts/workforce/interfaces/components/team/team-page-view";

export default async function TeamPage() {
  const establishmentId = await createBusinessEstablishmentAclService().getActiveEstablishmentIdForUser();
  let members: Awaited<ReturnType<ReturnType<typeof createTeamQueryService>["list"]>>["content"] = [];
  if (establishmentId) {
    try {
      members = (await createTeamQueryService().list({ establishmentId, size: 100 })).content;
    } catch {
      // Keep the team shell available while workforce is unavailable.
    }
  }
  return <TeamPageView establishmentId={establishmentId} members={members} />;
}
