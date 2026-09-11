import "server-only";

import { cookies } from "next/headers";

import { apiConfig } from "@/api.config";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import type { PageResponse } from "@/contexts/shared/application/model/page-response";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import {
  workforceInvitationAcceptanceSchema,
  workforceInvitationPreviewSchema,
  workforceInvitationSchema,
  workforceMemberPageSchema,
  workforceRolePageSchema,
  workforceRoleSchema,
  type CreateWorkforceInvitationInput,
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
    return parsed.content;
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
    body: { name: string; permissions: string[] },
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

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await apiClient.delete(
      `${apiConfig.routes.workforce.members}/${encodeURIComponent(memberId)}`,
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
