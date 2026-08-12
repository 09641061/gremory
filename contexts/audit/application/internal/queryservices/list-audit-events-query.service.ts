import "server-only";

import { listAuditEventsQuery, type ListAuditEventsQuery } from "../../../domain/model/queries/list-audit-events.query";
import type { AuditRepository } from "../../../domain/services/audit.repository";
import type { AuditEventSummary, AuditPageView } from "../../model/audit.read-models";
import type { AuditQueryService } from "../../services/audit-query.service";
import { AuditApiGateway } from "../../../infrastructure/gateways/audit-api.gateway";
import type { AuditPageResource } from "../../../interfaces/rest/schemas/audit.schemas";

export class ListAuditEventsQueryService implements AuditQueryService {
  constructor(private readonly audit: AuditRepository) {}

  async list(query: ListAuditEventsQuery): Promise<AuditPageView> {
    const page = await this.audit.list(listAuditEventsQuery(query));
    return {
      ...page,
      content: page.content.map(toAuditEventSummary),
    };
  }
}

export function createAuditQueryService(token?: string): AuditQueryService {
  return new ListAuditEventsQueryService(new AuditApiGateway(token));
}

function toAuditEventSummary(resource: AuditPageResource["content"][number]): AuditEventSummary {
  return {
    id: resource.id,
    occurredAt: resource.occurredAt,
    boundedContext: resource.boundedContext,
    action: resource.action,
    actor: {
      userId: resource.actorUserId,
      username: resource.actor?.username ?? (resource.actorUserId ? "Usuario no disponible" : "Sistema"),
      email: resource.actor?.email ?? null,
    },
    organizationId: resource.organizationId,
    organizationName: resource.organizationName ?? null,
    establishmentId: resource.establishmentId,
    establishmentName: resource.establishmentName ?? null,
    resource: {
      type: resource.resourceType,
      id: resource.resourceId,
      name: resource.resourceName ?? null,
    },
    changes: resource.changes,
  };
}
