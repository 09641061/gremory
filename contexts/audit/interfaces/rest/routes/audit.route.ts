import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditQueryService } from "@/contexts/audit/application/internal/queryservices/list-audit-events-query.service";
import { listAuditEventsQuery } from "@/contexts/audit/domain/model/queries/list-audit-events.query";
import { AuditApiError } from "@/contexts/audit/infrastructure/gateways/audit-api.gateway";

const uuid = z.string().uuid();
const querySchema = z.object({
  organizationId: uuid.optional(),
  establishmentId: uuid.optional(),
  actorUserId: uuid.optional(),
  boundedContext: z.enum(["IAM", "BILLING", "BUSINESS", "CATALOG", "WORKFORCE", "SCHEDULING", "CRM", "PROFILES"]).optional(),
  action: z.string().trim().min(1).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
}).superRefine((value, context) => {
  if ((value.organizationId == null) === (value.establishmentId == null)) {
    context.addIssue({ code: "custom", message: "Exactly one audit scope is required", path: ["organizationId"] });
  }
});

export async function listAuditEventsRoute(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      organizationId: url.searchParams.get("organizationId") ?? undefined,
      establishmentId: url.searchParams.get("establishmentId") ?? undefined,
      actorUserId: url.searchParams.get("actorUserId") ?? undefined,
      boundedContext: url.searchParams.get("boundedContext") ?? undefined,
      action: url.searchParams.get("action") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      size: url.searchParams.get("size") ?? undefined,
    });
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    return NextResponse.json(await createAuditQueryService().list(listAuditEventsQuery(parsed.data)));
  } catch (error) {
    const status = error instanceof AuditApiError ? (error.status > 0 ? error.status : 502) : 400;
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status });
  }
}
