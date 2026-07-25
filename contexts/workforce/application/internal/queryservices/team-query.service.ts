import "server-only";

import type {
  ListTeamUsersQuery,
  PreviewTeamInvitationQuery,
} from "../../../domain/model/queries/team.queries";
import { listTeamUsersQuery } from "../../../domain/model/queries/team.queries";
import { createInvitationToken } from "../../../domain/model/valueobjects/invitation-token.vo";
import { createTeamEstablishmentId } from "../../../domain/model/valueobjects/team-identifiers.vo";
import type { TeamRepository } from "../../../domain/services/team.repository";
import { TeamApiGateway } from "../../../infrastructure/gateways/team-api.gateway";
import type {
  TeamInvitationPreviewView,
  TeamUserSummary,
} from "../../model/team.read-models";
import type { TeamQueryService } from "../../services/team.services";

export class TeamQueryServiceImpl implements TeamQueryService {
  constructor(private readonly team: TeamRepository) {}

  async list(query: ListTeamUsersQuery = {}) {
    const validated = listTeamUsersQuery(query);
    const page = await this.team.list({
      establishmentId: validated.establishmentId
        ? createTeamEstablishmentId(validated.establishmentId)
        : undefined,
      status: validated.status,
      page: validated.page ?? 0,
      size: validated.size ?? 20,
    });
    return {
      ...page,
      content: page.content.map(toTeamUserSummary),
    };
  }

  async previewInvitation(
    query: PreviewTeamInvitationQuery,
  ): Promise<TeamInvitationPreviewView> {
    const preview = await this.team.previewInvitation(
      createInvitationToken(query.token),
    );
    return {
      organizationId: preview.organizationId.value,
      organizationName: preview.organizationName,
      establishmentId: preview.establishmentId.value,
      establishmentName: preview.establishmentName,
      maskedEmail: preview.maskedEmail,
      status: preview.status,
      expiresAt: preview.expiresAt.toISOString(),
    };
  }
}

export function createTeamQueryService(token?: string): TeamQueryService {
  return new TeamQueryServiceImpl(new TeamApiGateway(token));
}

function toTeamUserSummary(
  user: Awaited<ReturnType<TeamRepository["list"]>>["content"][number],
): TeamUserSummary {
  return {
    invitationId: user.invitationId.value,
    memberId: user.memberId?.value ?? null,
    userId: user.userId?.value ?? null,
    email: user.email.value,
    role: user.role,
    organizationId: user.organizationId.value,
    establishmentId: user.establishmentId.value,
    establishmentName: user.establishmentName,
    status: user.status,
    hasAcceptedInvitation: user.hasAcceptedInvitation,
    canRevokeInvitation: user.canRevokeInvitation,
    canRemoveMembership: user.canRemoveMembership,
    invitedAt: user.invitedAt.toISOString(),
    invitationExpiresAt: user.invitationExpiresAt.toISOString(),
    acceptedAt: user.acceptedAt?.toISOString() ?? null,
    joinedAt: user.joinedAt?.toISOString() ?? null,
    removedAt: user.removedAt?.toISOString() ?? null,
  };
}
