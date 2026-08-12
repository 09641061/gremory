import type { AuditBoundedContext } from "../../domain/model/queries/list-audit-events.query";

export interface AuditActorView {
  userId: string | null;
  username: string;
  email: string | null;
}

export interface AuditResourceView {
  type: string | null;
  id: string | null;
  name: string | null;
}

export interface AuditEventSummary {
  id: string;
  occurredAt: string;
  boundedContext: AuditBoundedContext;
  action: string;
  actor: AuditActorView;
  organizationId: string | null;
  organizationName: string | null;
  establishmentId: string | null;
  establishmentName: string | null;
  resource: AuditResourceView;
  changes: Record<string, { from: string | null; to: string | null }> | null;
}

export interface AuditPageView {
  content: AuditEventSummary[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
