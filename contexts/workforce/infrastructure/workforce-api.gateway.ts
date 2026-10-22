import "server-only";

import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import type { WorkforceGateway } from "../application/ports/workforce-gateway";
import {
  acceptedWorkforceInvitationSchema,
  workforceInvitationListSchema,
  workforceInvitationPreviewSchema,
  workforceInvitationSchema,
  workforceMemberListSchema,
} from "../interfaces/rest/workforce.schemas";

export class WorkforceApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown, options?: ErrorOptions) {
    super(message, status, details, options);
    this.name = "WorkforceApiError";
  }
}

export class WorkforceApiGateway implements WorkforceGateway {
  private readonly invitations = apiConfig.routes.workforce.invitations;

  async listInvitations(accessToken: string, organizationId: string) {
    const response = await apiClient.get<unknown>(this.invitations, this.auth(accessToken, organizationId));
    return workforceInvitationListSchema.parse(response);
  }

  async invite(accessToken: string, organizationId: string, input: { email: string; establishmentId: string }) {
    const response = await apiClient.post<unknown>(this.invitations, input, this.auth(accessToken, organizationId));
    return workforceInvitationSchema.parse(response);
  }

  async resend(accessToken: string, organizationId: string, invitationId: string) {
    const response = await apiClient.post<unknown>(
      `${this.invitations}/${encodeURIComponent(invitationId)}/resend`,
      {},
      this.auth(accessToken, organizationId),
    );
    return workforceInvitationSchema.parse(response);
  }

  async revoke(accessToken: string, organizationId: string, invitationId: string) {
    await apiClient.delete(`${this.invitations}/${encodeURIComponent(invitationId)}`, this.auth(accessToken, organizationId));
  }

  async preview(token: string) {
    const params = new URLSearchParams({ token });
    const response = await apiClient.get<unknown>(`${this.invitations}/preview?${params}`, {
      errorMessage: "No se pudo consultar la invitación",
      errorType: WorkforceApiError,
    });
    return workforceInvitationPreviewSchema.parse(response);
  }

  async accept(accessToken: string, token: string) {
    const response = await apiClient.post<unknown>(`${this.invitations}/accept`, { token }, {
      token: accessToken,
      errorMessage: "No se pudo aceptar la invitación",
      errorType: WorkforceApiError,
    });
    return acceptedWorkforceInvitationSchema.parse(response);
  }

  async listMembers(accessToken: string, organizationId: string) {
    const response = await apiClient.get<unknown>(apiConfig.routes.workforce.members, this.auth(accessToken, organizationId));
    return workforceMemberListSchema.parse(response);
  }

  async deactivateMember(accessToken: string, organizationId: string, membershipId: string) {
    await apiClient.delete(
      `${apiConfig.routes.workforce.members}/${encodeURIComponent(membershipId)}`,
      this.auth(accessToken, organizationId),
    );
  }

  private auth(token: string, tenantId: string) {
    return {
      token,
      tenantId,
      errorMessage: "No se pudo completar la operación de colaboradores",
      errorType: WorkforceApiError,
    };
  }
}
