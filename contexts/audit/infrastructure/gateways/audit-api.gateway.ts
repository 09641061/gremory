import "server-only";

import { apiConfig } from "@/api.config";
import { apiClient, ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { auditPageResourceSchema, type AuditPageResource } from "../../interfaces/rest/schemas/audit.schemas";
import type { AuditRepository } from "../../domain/services/audit.repository";
import type { ListAuditEventsQuery } from "../../domain/model/queries/list-audit-events.query";
import { getTeamAccessToken } from "@/contexts/workforce/infrastructure/session/team-session";

export class AuditApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "AuditApiError";
  }
}

export class AuditApiGateway implements AuditRepository {
  constructor(private readonly providedToken?: string) {}

  async list(query: ListAuditEventsQuery): Promise<AuditPageResource> {
    const token = await getTeamAccessToken(this.providedToken);
    const params = new URLSearchParams();
    if (query.organizationId) params.set("organizationId", query.organizationId);
    if (query.establishmentId) params.set("establishmentId", query.establishmentId);
    if (query.actorUserId) params.set("actorUserId", query.actorUserId);
    if (query.boundedContext) params.set("boundedContext", query.boundedContext);
    if (query.action) params.set("action", query.action);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    params.set("page", String(query.page ?? 0));
    params.set("size", String(query.size ?? 20));
    const response = await apiClient.request<unknown>(
      `${apiConfig.routes.audit.events}?${params}`,
      { method: "GET", token, errorType: AuditApiError, errorMessage: "Audit API request failed" },
    );
    return auditPageResourceSchema.parse(response);
  }
}
