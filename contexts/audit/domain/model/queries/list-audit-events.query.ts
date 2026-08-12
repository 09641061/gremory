export type AuditBoundedContext =
  | "IAM"
  | "BILLING"
  | "BUSINESS"
  | "CATALOG"
  | "WORKFORCE"
  | "SCHEDULING"
  | "CRM"
  | "PROFILES";

export type ListAuditEventsQuery = Readonly<{
  organizationId?: string;
  establishmentId?: string;
  actorUserId?: string;
  boundedContext?: AuditBoundedContext;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}>;

export function listAuditEventsQuery(input: ListAuditEventsQuery = {}): ListAuditEventsQuery {
  if ((input.organizationId == null) === (input.establishmentId == null)) {
    throw new Error("Exactly one audit scope is required");
  }
  const page = input.page ?? 0;
  const size = input.size ?? 20;
  if (!Number.isInteger(page) || page < 0) throw new Error("Page must be non-negative");
  if (!Number.isInteger(size) || size < 1 || size > 100) throw new Error("Page size must be between 1 and 100");
  return Object.freeze({ ...input, page, size });
}
