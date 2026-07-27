import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { getTeamAccessToken } from "@/contexts/workforce/infrastructure/session/team-session";
import {
  InvitationAcceptanceView,
  InvitationExpiredView,
  InvitationUnavailableView,
} from "@/contexts/workforce/interfaces/components/invitations/invitation-acceptance-view";
import type { TeamInvitationPreviewView } from "@/contexts/workforce/application/model/team.read-models";
import { TeamApiError } from "@/contexts/workforce/infrastructure/gateways/team-api.gateway";

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
  } catch (error) {
    if (isExpiredInvitationError(error)) {
      return <InvitationExpiredView />;
    }
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

function isExpiredInvitationError(error: unknown): boolean {
  if (!(error instanceof TeamApiError) || !error.details || typeof error.details !== "object") {
    return false;
  }
  return (error.details as Record<string, unknown>).code === "INVITATION_EXPIRED";
}
