import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { getTeamAccessToken } from "@/contexts/workforce/infrastructure/session/team-session";
import {
  InvitationAcceptanceView,
  InvitationUnavailableView,
} from "@/contexts/workforce/interfaces/components/invitation-acceptance-view";
import type { TeamInvitationPreviewView } from "@/contexts/workforce/application/model/team.read-models";

export default async function InvitationAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const tokenParam = (await searchParams).token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  if (!token) return <InvitationUnavailableView />;

  const accessToken = await getTeamAccessToken();
  let invitation: TeamInvitationPreviewView;
  try {
    invitation = await createTeamQueryService(accessToken).previewInvitation({ token });
  } catch {
    return <InvitationUnavailableView />;
  }

  const authenticated = Boolean(accessToken);
  return (
    <InvitationAcceptanceView
      token={token}
      invitation={invitation}
      authenticated={authenticated}
    />
  );
}
