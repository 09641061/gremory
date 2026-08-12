import { z } from "zod";

const uuid = z.string().uuid();
const dateTime = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date-time");
const boundedContext = z.enum(["IAM", "BILLING", "BUSINESS", "CATALOG", "WORKFORCE", "SCHEDULING", "CRM", "PROFILES"]);
const changes = z.record(z.string(), z.object({ from: z.string().nullable(), to: z.string().nullable() })).nullable();

export const auditEventResourceSchema = z.object({
  id: uuid,
  occurredAt: dateTime,
  boundedContext,
  action: z.string().min(1),
  actorUserId: uuid.nullable(),
  actor: z.object({ username: z.string().min(1), email: z.string().email().nullable() }).nullable().optional(),
  resourceType: z.string().nullable(),
  resourceId: uuid.nullable(),
  resourceName: z.string().nullable().optional(),
  organizationId: uuid.nullable(),
  organizationName: z.string().nullable().optional(),
  establishmentId: uuid.nullable(),
  establishmentName: z.string().nullable().optional(),
  changes,
});

export const auditPageResourceSchema = z.object({
  content: z.array(auditEventResourceSchema),
  number: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  first: z.boolean(),
  last: z.boolean(),
  numberOfElements: z.number().int().nonnegative(),
  empty: z.boolean(),
});

export type AuditPageResource = z.infer<typeof auditPageResourceSchema>;
