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
  TeamMembershipContext,
  TeamPageResult,
  TeamRepository,
  TeamUserCriteria,
} from "../../domain/services/team.repository";
import {
  invitationAcceptanceResourceSchema,
  invitationCreatedResourceSchema,
  invitationPreviewResourceSchema,
  workforceCurrentMemberResourceSchema,
  teamPageResourceSchema,
  workforceAccessResourceSchema,
} from "../../interfaces/rest/schemas/team.schemas";
import { teamDelete, teamGet, teamPost } from "../http/team-api.client";
import { requireTeamAccessToken } from "../session/team-session";
export { TeamApiError } from "../http/team-api.client";

export class TeamApiGateway implements TeamRepository {
  constructor(
    private readonly providedToken?: string,
    private readonly organizationId?: string,
  ) {}

  private tenantHeaders() {
    return this.organizationId ? { "X-Organization-Id": this.organizationId } : undefined;
  }

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
    const headers = criteria.organizationId
      ? { "X-Organization-Id": criteria.organizationId }
      : undefined;

    const response = await teamGet<unknown>(
      `${apiConfig.routes.workforce.members}?${params}`,
      token,
      headers,
    );
    const resource = teamPageResourceSchema.parse(response);
    return {
      number: resource.page,
      size: resource.size,
      totalElements: resource.totalElements,
      totalPages: resource.totalPages,
      first: resource.page === 0,
      last: resource.totalPages === 0 || resource.page >= resource.totalPages - 1,
      numberOfElements: resource.content.length,
      empty: resource.content.length === 0,
      content: resource.content.map(toTeamUser),
    };
  }

  async getMyMembership(establishmentId?: TeamEstablishmentId): Promise<TeamMembershipContext | null> {
    const token = await requireTeamAccessToken(this.providedToken);
    const params = establishmentId ? new URLSearchParams({ establishmentId: establishmentId.value }) : null;
    const response = await teamGet<unknown>(
      params
        ? `${apiConfig.routes.workforce.members}/me?${params}`
        : `${apiConfig.routes.workforce.members}/me`,
      token,
      this.tenantHeaders(),
    );
    const resource = workforceCurrentMemberResourceSchema.parse(response);
    return {
      memberId: resource.memberId ? createMemberId(resource.memberId) : null,
      userId: resource.userId ? createTeamUserId(resource.userId) : null,
      organizationId: createTeamOrganizationId(resource.organizationId),
      organizationName: resource.organizationName,
       establishmentId: resource.establishmentId
         ? createTeamEstablishmentId(resource.establishmentId)
         : null,
      establishmentName: resource.establishmentName,
      status: resource.status,
      roles: (resource.roles ?? []).map(toTeamRoleSummary),
      isOwner: resource.isOwner,
      availableForScheduling: resource.availableForScheduling,
      canUpdateSchedulingAvailability: resource.canUpdateSchedulingAvailability,
      username: resource.username ?? null,
      imageUrl: resource.imageUrl ?? null,
      email: createInvitedEmail(resource.email),
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
      this.tenantHeaders(),
    );
    return createInvitationId(invitationCreatedResourceSchema.parse(response).id);
  }

  async revokeInvitation(invitationId: InvitationId): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.invitations}/${encodeURIComponent(invitationId.value)}`,
      token,
      this.tenantHeaders(),
    );
  }

  async removeMember(memberId: MemberId): Promise<void> {
    const token = await requireTeamAccessToken(this.providedToken);
    await teamDelete(
      `${apiConfig.routes.workforce.members}/${encodeURIComponent(memberId.value)}`,
      token,
      this.tenantHeaders(),
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

  async acceptPendingInvitation(): Promise<MemberId> {
    const accessToken = await requireTeamAccessToken(this.providedToken);
    const response = await teamPost<unknown>(
      `${apiConfig.routes.workforce.invitations}/accept-pending`,
      {},
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
      membershipCapabilities: resource.membershipCapabilities,
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

function toTeamRoleSummary(role: {
  id: string;
  name: string;
  position: number;
  systemRole: boolean;
  permissions: string[];
}): TeamMembershipContext["roles"][number] {
  return {
    id: createTeamRoleId(role.id),
    name: role.name,
    position: role.position,
    systemRole: role.systemRole,
    permissions: role.permissions,
  };
}

function toTeamUser(resource: {
  invitationId: string;
  memberId: string | null;
  userId: string | null;
  username?: string | null;
  imageUrl?: string | null;
  email: string;
  isOwner: boolean;
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
  availableForScheduling: boolean;
  canUpdateSchedulingAvailability: boolean;
}): TeamUser {
  const roles = resource.roles ?? [];
  return TeamUser.create({
    invitationId: createInvitationId(resource.invitationId),
    memberId: resource.memberId ? createMemberId(resource.memberId) : null,
    userId: resource.userId ? createTeamUserId(resource.userId) : null,
    name: resource.username ?? null,
    imageUrl: resource.imageUrl ?? null,
    email: createInvitedEmail(resource.email),
    roleId: roles[0]?.id ? createTeamRoleId(roles[0].id) : null,
    roleName: roles[0]?.name ?? null,
    isOwner: resource.isOwner,
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
    availableForScheduling: resource.availableForScheduling,
    canUpdateSchedulingAvailability: resource.canUpdateSchedulingAvailability,
  });
}

function toOptionalDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}
