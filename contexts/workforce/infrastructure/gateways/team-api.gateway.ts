import "server-only";

import { apiConfig } from "@/api.config";
import { TeamUser } from "../../domain/model/entities/team-user.entity";
import type { WorkforceUserStatus } from "../../domain/model/enums/workforce-user-status";
import { createInvitedEmail, type InvitedEmail } from "../../domain/model/valueobjects/invited-email.vo";
import type { InvitationToken } from "../../domain/model/valueobjects/invitation-token.vo";
import {
  createInvitationId,
  createMemberId,
  createTeamEstablishmentId,
  createTeamOrganizationId,
  createTeamRoleId,
  createTeamUserId,
  type InvitationId,
  type MemberId,
  type TeamEstablishmentId,
} from "../../domain/model/valueobjects/team-identifiers.vo";
import type {
  TeamInvitationPreview,
  TeamPageResult,
  TeamRepository,
  TeamUserCriteria,
} from "../../domain/services/team.repository";
import {
  invitationAcceptanceResourceSchema,
  invitationCreatedResourceSchema,
  invitationPreviewResourceSchema,
  teamPageResourceSchema,
  workforceAccessResourceSchema,
} from "../../interfaces/rest/schemas/team.schemas";
import { teamDelete, teamGet, teamPost } from "../http/team-api.client";
import { requireTeamAccessToken } from "../session/team-session";
export { TeamApiError } from "../http/team-api.client";

export class TeamApiGateway implements TeamRepository {
  constructor(private readonly providedToken?: string) {}

  async list(criteria: TeamUserCriteria): Promise<TeamPageResult<TeamUser>> {
    const token = await requireTeamAccessToken(this.providedToken);
    const params = new URLSearchParams({
      page: String(criteria.page),
      size: String(criteria.size),
    });
    if (criteria.establishmentId) {
      params.set("establishmentId", criteria.establishmentId.value);
    }
    if (criteria.status) params.set("status", criteria.status);

    const response = await teamGet<unknown>(
      `${apiConfig.routes.workforce.members}?${params}`,
      token,
    );
    const resource = teamPageResourceSchema.parse(response);
    return {
      ...resource,
      content: resource.content.map(toTeamUser),
    };
  }

  async invite(
    establishmentId: TeamEstablishmentId,
    email: InvitedEmail,
  ): Promise<InvitationId> {
    const token = await requireTeamAccessToken(this.providedToken);
    const response = await teamPost<unknown>(
      apiConfig.routes.workforce.invitations,
      { establishmentId: establishmentId.value, email: email.value },
      token,
    );
    return createInvitationId(invitationCreatedResourceSchema.parse(response).id);
  }

  async revokeInvitation(invitationId: InvitationId): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.invitations}/${encodeURIComponent(invitationId.value)}`,
      token,
    );
  }

  async removeMember(memberId: MemberId): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.members}/${encodeURIComponent(memberId.value)}`,
      token,
    );
  }

  async previewInvitation(
    token: InvitationToken,
  ): Promise<TeamInvitationPreview> {
    const params = new URLSearchParams({ token: token.value });
    const response = await teamGet<unknown>(
      `${apiConfig.routes.workforce.invitations}/preview?${params}`,
      this.providedToken,
    );
    const resource = invitationPreviewResourceSchema.parse(response);
    return {
      organizationId: createTeamOrganizationId(resource.organizationId),
      organizationName: resource.organizationName,
      establishmentId: createTeamEstablishmentId(resource.establishmentId),
      establishmentName: resource.establishmentName,
      maskedEmail: resource.maskedEmail,
      status: resource.status,
      expiresAt: new Date(resource.expiresAt),
    };
  }

  async acceptInvitation(token: InvitationToken): Promise<MemberId> {
    const accessToken = await requireTeamAccessToken(this.providedToken);
    const response = await teamPost<unknown>(
      `${apiConfig.routes.workforce.invitations}/accept`,
      { token: token.value },
      accessToken,
    );
    const resource = invitationAcceptanceResourceSchema.parse(response);
    return createMemberId(resource.membership.id);
  }

  async getAccessContext() {
    const accessToken = await requireTeamAccessToken(this.providedToken);
    const response = await teamGet<unknown>(
      apiConfig.routes.workforce.access,
      accessToken,
    );
    const resource = workforceAccessResourceSchema.parse(response);
    return {
      active: resource.active,
      establishments: resource.establishments.map((establishment) => ({
        organizationId: createTeamOrganizationId(establishment.organizationId),
        organizationName: establishment.organizationName,
        establishmentId: createTeamEstablishmentId(establishment.establishmentId),
        establishmentName: establishment.establishmentName,
        roles: establishment.roles ?? [],
        effectivePermissions: establishment.effectivePermissions ?? [],
      })),
    };
  }
}

function toTeamUser(resource: {
  invitationId: string;
  memberId: string | null;
  userId: string | null;
  email: string;
  roleId?: string;
  roleName?: string;
  roles?: Array<{
    id: string;
    name: string;
    position: number;
    systemRole: boolean;
    permissions: string[];
  }>;
  organizationId: string;
  establishmentId: string;
  establishmentName: string | null;
  status: WorkforceUserStatus;
  invitedAt: string;
  invitationExpiresAt: string;
  acceptedAt: string | null;
  joinedAt: string | null;
  removedAt: string | null;
}): TeamUser {
  const roles = resource.roles ?? (resource.roleId ? [{ id: resource.roleId, name: resource.roleName ?? "Everyone", position: 2_147_483_647, systemRole: true, permissions: [] }] : []);
  return TeamUser.create({
    invitationId: createInvitationId(resource.invitationId),
    memberId: resource.memberId ? createMemberId(resource.memberId) : null,
    userId: resource.userId ? createTeamUserId(resource.userId) : null,
    email: createInvitedEmail(resource.email),
    roleId: createTeamRoleId(roles[0]?.id ?? resource.roleId ?? "00000000-0000-4000-8000-000000000000"),
    roleName: roles[0]?.name ?? resource.roleName ?? "Everyone",
    roles: roles.map((role) => ({
      id: createTeamRoleId(role.id),
      name: role.name,
      position: role.position,
      systemRole: role.systemRole,
      permissions: role.permissions,
    })),
    organizationId: createTeamOrganizationId(resource.organizationId),
    establishmentId: createTeamEstablishmentId(resource.establishmentId),
    establishmentName: resource.establishmentName,
    status: resource.status,
    invitedAt: new Date(resource.invitedAt),
    invitationExpiresAt: new Date(resource.invitationExpiresAt),
    acceptedAt: toOptionalDate(resource.acceptedAt),
    joinedAt: toOptionalDate(resource.joinedAt),
    removedAt: toOptionalDate(resource.removedAt),
  });
}

function toOptionalDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}
