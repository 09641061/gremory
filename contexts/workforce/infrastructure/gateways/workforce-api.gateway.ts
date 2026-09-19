import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";

import { apiConfig } from "@/api.config";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import type { PageResponse } from "@/contexts/shared/application/model/page-response";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import {
  normalizeRoleId,
  shareableInvitationLinkSchema,
  shareableInvitationPreviewSchema,
  workforceInvitationAcceptanceSchema,
  workforceInvitationPreviewSchema,
  workforceInvitationSchema,
  workforceMemberPageSchema,
  workforceRolePageSchema,
  workforceRoleSchema,
  type CreateWorkforceInvitationInput,
  type ShareableInvitationLinkResource,
  type ShareableInvitationPreview,
  type WorkforceInvitationAcceptanceResource,
  type WorkforceInvitationPreviewResource,
  type WorkforceInvitationResource,
  type WorkforceMemberResource,
  type WorkforceRoleResource,
} from "../../interfaces/rest/schemas/workforce-member.schemas";

export class WorkforceApiGateway {
  async listMembers(
    organizationId: string,
    page: number,
    size: number,
  ): Promise<PageResponse<WorkforceMemberResource>> {
    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.workforce.members}?${new URLSearchParams({ page: String(page), size: String(size) })}`,
      { token: await this.accessToken(), headers: this.organizationHeader(organizationId) },
    );
    return workforceMemberPageSchema.parse(response);
  }

  async listRoles(organizationId: string): Promise<WorkforceRoleResource[]> {
    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.workforce.roles}?${new URLSearchParams({ page: "0", size: "100" })}`,
      { token: await this.accessToken(), headers: this.organizationHeader(organizationId) },
    );
    const parsed = workforceRolePageSchema.parse(response);
    return parsed.content.map((role) => ({ ...role, id: normalizeRoleId(role.id) }));
  }

  async createRole(organizationId: string, name: string): Promise<WorkforceRoleResource> {
    const response = await apiClient.post<unknown>(apiConfig.routes.workforce.roles, { name }, {
      token: await this.accessToken(), headers: this.organizationHeader(organizationId),
      errorMessage: "Failed to create workforce role",
    });
    return workforceRoleSchema.parse(response);
  }

  async updateRole(
    organizationId: string,
    roleId: string,
    body: { name?: string; permissions?: string[]; color?: string },
  ): Promise<WorkforceRoleResource> {
    const response = await apiClient.patch<unknown>(
      `${apiConfig.routes.workforce.roles}/${encodeURIComponent(roleId)}`,
      body,
      {
        token: await this.accessToken(), headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to update workforce role",
      },
    );
    return workforceRoleSchema.parse(response);
  }

  async deleteRole(organizationId: string, roleId: string): Promise<void> {
    await apiClient.delete(
      `${apiConfig.routes.workforce.roles}/${encodeURIComponent(roleId)}`,
      {
        token: await this.accessToken(), headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to delete workforce role",
      },
    );
  }

  async createInvitation(
    organizationId: string,
    body: CreateWorkforceInvitationInput,
  ): Promise<WorkforceInvitationResource> {
    const response = await apiClient.post<unknown>(apiConfig.routes.workforce.invitations, body, {
      token: await this.accessToken(),
      headers: this.organizationHeader(organizationId),
      errorMessage: "Failed to create workforce invitation",
    });
    return workforceInvitationSchema.parse(response);
  }

  async resendInvitation(
    organizationId: string,
    invitationId: string,
  ): Promise<WorkforceInvitationResource> {
    const response = await apiClient.post<unknown>(
      `${apiConfig.routes.workforce.invitations}/${encodeURIComponent(invitationId)}/resend`,
      undefined,
      {
        token: await this.accessToken(),
        headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to resend workforce invitation",
      },
    );
    return workforceInvitationSchema.parse(response);
  }

  /** Creates a shareable, multi-use invitation link and returns its one-time URL. */
  async createShareableInvitationLink(
    organizationId: string,
    body: { establishmentIds: string[]; roleIds: string[]; expiration: string },
  ): Promise<ShareableInvitationLinkResource> {
    const response = await apiClient.post<unknown>(
      `${apiConfig.routes.workforce.invitations}/shareable-links`,
      body,
      {
        token: await this.accessToken(),
        headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to create shareable invitation link",
      },
    );
    return shareableInvitationLinkSchema.parse(response);
  }

  /** Lists an organization's active shareable invitation links. */
  async listShareableInvitationLinks(organizationId: string): Promise<ShareableInvitationLinkResource[]> {
    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.workforce.invitations}/shareable-links`,
      { token: await this.accessToken(), headers: this.organizationHeader(organizationId) },
    );
    return z.array(shareableInvitationLinkSchema).parse(response);
  }

  /** Revokes a shareable invitation link; its token stops resolving immediately. */
  async revokeShareableInvitationLink(organizationId: string, linkId: string): Promise<void> {
    await apiClient.delete(
      `${apiConfig.routes.workforce.invitations}/shareable-links/${encodeURIComponent(linkId)}`,
      {
        token: await this.accessToken(),
        headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to revoke shareable invitation link",
      },
    );
  }

  /** Public, non-consuming preview of a shareable link. No session is required. */
  async previewShareableInvitationLink(token: string): Promise<ShareableInvitationPreview> {
    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.workforce.invitations}/shareable-links/preview?${new URLSearchParams({ token })}`,
      { errorMessage: "Failed to preview invitation link" },
    );
    return shareableInvitationPreviewSchema.parse(response);
  }

  /** Redeems a shareable multi-use link for the authenticated account. */
  async acceptShareableInvitationLink(token: string): Promise<void> {
    await apiClient.post<unknown>(
      `${apiConfig.routes.workforce.invitations}/shareable-links/accept`,
      { token },
      { token: await this.accessToken(), errorMessage: "Failed to accept invitation link" },
    );
  }

  /** Replaces the role mapping a still-pending invitation grants on acceptance. */
  async updateInvitationRoles(
    organizationId: string,
    invitationId: string,
    roleIds: string[],
  ): Promise<void> {
    await apiClient.put(
      `${apiConfig.routes.workforce.invitations}/${encodeURIComponent(invitationId)}/roles`,
      { roleIds },
      {
        token: await this.accessToken(),
        headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to update invitation roles",
      },
    );
  }

  /** Revokes a pending invitation; the token stops resolving immediately. */
  async revokeInvitation(organizationId: string, invitationId: string): Promise<void> {
    await apiClient.delete(
      `${apiConfig.routes.workforce.invitations}/${encodeURIComponent(invitationId)}`,
      {
        token: await this.accessToken(),
        headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to revoke workforce invitation",
      },
    );
  }

  async updateMemberScope(
    organizationId: string,
    memberId: string,
    establishmentIds: string[],
  ): Promise<void> {
    await apiClient.put(
      `${apiConfig.routes.workforce.members}/${encodeURIComponent(memberId)}/scope`,
      { establishmentIds },
      {
        token: await this.accessToken(),
        headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to update member scope",
      },
    );
  }

  /** Public, non-consuming preview. No session is required and the raw token never leaves the server. */
  async previewInvitation(token: string): Promise<WorkforceInvitationPreviewResource> {
    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.workforce.invitations}/preview?${new URLSearchParams({ token })}`,
      { errorMessage: "Failed to preview invitation" },
    );
    return workforceInvitationPreviewSchema.parse(response);
  }

  async acceptInvitation(token: string): Promise<WorkforceInvitationAcceptanceResource> {
    const response = await apiClient.post<unknown>(
      `${apiConfig.routes.workforce.invitations}/accept`,
      { token },
      { token: await this.accessToken(), errorMessage: "Failed to accept invitation" },
    );
    return workforceInvitationAcceptanceSchema.parse(response);
  }

  async assignRole(organizationId: string, memberId: string, roleId: string): Promise<void> {
    await apiClient.put(
      `${apiConfig.routes.workforce.roles}/members/${encodeURIComponent(memberId)}`,
      { roleId },
      { token: await this.accessToken(), headers: this.organizationHeader(organizationId) },
    );
  }

  async removeRoleAssignment(organizationId: string, memberId: string, roleId: string): Promise<void> {
    await apiClient.delete(
      `${apiConfig.routes.workforce.roles}/members/${encodeURIComponent(memberId)}/${encodeURIComponent(roleId)}`,
      {
        token: await this.accessToken(),
        headers: this.organizationHeader(organizationId),
        errorMessage: "Failed to remove workforce role assignment",
      },
    );
  }

  /**
   * Evicts a member from the whole organization: every establishment membership of the
   * user is removed in one backend transaction, keyed by user id rather than a single
   * establishment membership.
   */
  async evictOrganizationMember(organizationId: string, userId: string): Promise<void> {
    await apiClient.delete(
      `${apiConfig.routes.workforce.organizations}/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(userId)}`,
      { token: await this.accessToken(), headers: this.organizationHeader(organizationId) },
    );
  }

  private async accessToken(): Promise<string> {
    const cookieStore = await cookies();
    const token = cookieStore.get(iamSessionCookies.accessToken)?.value;
    if (!token) throw new Error("Authentication is required");
    return token;
  }

  private organizationHeader(organizationId: string) {
    return { "X-Organization-Id": organizationId };
  }
}
