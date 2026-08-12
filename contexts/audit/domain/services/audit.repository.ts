import type { ListAuditEventsQuery } from "../model/queries/list-audit-events.query";
import type { AuditPageResource } from "../../interfaces/rest/schemas/audit.schemas";

export interface AuditRepository {
  list(query: ListAuditEventsQuery): Promise<AuditPageResource>;
}
