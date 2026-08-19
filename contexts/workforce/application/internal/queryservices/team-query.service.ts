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
  TeamAccessView,
  TeamInvitationPreviewView,
  TeamUserSummary,
} from "../../model/team.read-models";
import type { TeamQueryService } from "../../services/team.services";

export class TeamQueryServiceImpl implements TeamQueryService {
  constructor(private readonly team: TeamRepository) {}

  async list(query: ListTeamUsersQuery = {}) {
    const validated = listTeamUsersQuery(query);
    const page = await this.team.list({
      organizationId: validated.organizationId,
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

  async getMyMembership(establishmentId?: string): Promise<TeamUserSummary | null> {
    const membership = await this.team.getMyMembership(
      establishmentId ? createTeamEstablishmentId(establishmentId) : undefined,
    );
    if (!membership) return null;
    const roles = membership.roles.map((role) => ({
      id: role.id.value,
      name: role.name,
      position: role.position,
      systemRole: role.systemRole,
      permissions: role.permissions,
    }));
    return {
      invitationId: null,
      memberId: membership.memberId?.value ?? null,
      userId: membership.userId?.value ?? null,
      name: membership.username,
      imageUrl: membership.imageUrl,
      email: membership.email.value,
      roleId: roles[0]?.id ?? null,
      roleName: roles[0]?.name ?? null,
      ...(membership.isOwner ? { isOwner: true } : {}),
      roles,
      organizationId: membership.organizationId.value,
      establishmentId: membership.establishmentId.value,
      establishmentName: membership.establishmentName,
      status: membership.status,
      hasAcceptedInvitation: membership.status === "ACTIVE" || membership.status === "REMOVED",
      canRevokeInvitation: false,
      canRemoveMembership: false,
      invitedAt: null,
      invitationExpiresAt: null,
      acceptedAt: null,
      joinedAt: null,
      removedAt: null,
      availableForScheduling: membership.availableForScheduling,
      canUpdateSchedulingAvailability: membership.canUpdateSchedulingAvailability,
    };
  }

  async getAccessContext(): Promise<TeamAccessView> {
    const access = await this.team.getAccessContext();
    return {
      active: access.active,
      membershipCapabilities: access.membershipCapabilities,
      establishments: access.establishments.map((establishment) => ({
        organizationId: establishment.organizationId.value,
        organizationName: establishment.organizationName,
        establishmentId: establishment.establishmentId.value,
        establishmentName: establishment.establishmentName,
        roles: establishment.roles,
        effectivePermissions: establishment.effectivePermissions,
      })),
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
    name: user.name,
    imageUrl: user.imageUrl,
    email: user.email.value,
    roleId: user.roleId?.value ?? null,
    roleName: user.roleName,
    ...(user.isOwner ? { isOwner: true } : {}),
    roles: user.roles.map((role) => ({
      id: role.id.value,
      name: role.name,
      position: role.position,
      systemRole: role.systemRole,
      permissions: role.permissions,
    })),
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
    availableForScheduling: user.availableForScheduling,
    canUpdateSchedulingAvailability: user.canUpdateSchedulingAvailability,
  };
}
