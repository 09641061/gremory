import { redirect } from "next/navigation";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamApiError } from "@/contexts/workforce/infrastructure/gateways/team-api.gateway";
import { getTeamAccessToken } from "@/contexts/workforce/infrastructure/session/team-session";
import { createTeamCommandService } from "@/contexts/workforce/application/internal/commandservices/team-command.service";
import { acceptTeamInvitationCommand } from "@/contexts/workforce/domain/model/commands/team.commands";
import { buildInvitationLandingHref } from "@/contexts/workforce/interfaces/components/invitations/invitation-navigation";
import {
  InvitationAcceptanceView,
  InvitationExpiredView,
  InvitationUnavailableView,
} from "@/contexts/workforce/interfaces/components/invitations/invitation-acceptance-view";
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
  } catch (error) {
    if (isExpiredInvitationError(error)) {
      return <InvitationExpiredView />;
    }
    if (isNotFoundInvitationError(error)) {
      return <InvitationUnavailableView />;
    }
    return <InvitationUnavailableView />;
  }

  const authenticated = Boolean(accessToken);
  if (authenticated && invitation.status === "PENDING") {
    try {
      await createTeamCommandService(accessToken).acceptInvitation(
        acceptTeamInvitationCommand({ token }),
      );
    } catch (error) {
      if (!isInvitationAlreadyHandledError(error)) {
        throw error;
      }
    }
    redirect(buildInvitationLandingHref(invitation.establishmentId));
  }

  return (
    <InvitationAcceptanceView
      token={token}
      invitation={invitation}
      authenticated={authenticated}
    />
  );
}

function isExpiredInvitationError(error: unknown): boolean {
  return error instanceof TeamApiError && error.status === 410;
}

function isNotFoundInvitationError(error: unknown): boolean {
  return error instanceof TeamApiError && error.status === 404;
}

function isInvitationAlreadyHandledError(error: unknown): boolean {
  return error instanceof TeamApiError && [404, 410].includes(error.status);
}
