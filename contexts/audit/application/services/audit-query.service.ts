import type { ListAuditEventsQuery } from "../../domain/model/queries/list-audit-events.query";
import type { AuditPageView } from "../model/audit.read-models";

export interface AuditQueryService {
  list(query: ListAuditEventsQuery): Promise<AuditPageView>;
}
