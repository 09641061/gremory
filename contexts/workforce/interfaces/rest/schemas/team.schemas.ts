import { z } from "zod";
import { workforceUserStatuses } from "../../../domain/model/enums/workforce-user-status";

const uuidSchema = z.string().uuid();
const dateTimeSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Invalid date-time",
);

export const inviteTeamUserSchema = z.object({
  establishmentId: uuidSchema,
  email: z.string().trim().email().max(254),
});

export const invitationIdSchema = uuidSchema;
export const memberIdSchema = uuidSchema;
export const invitationTokenSchema = z.string().trim().min(1).max(2048);

export const workforceUserResourceSchema = z.object({
  invitationId: uuidSchema,
  memberId: uuidSchema.nullable(),
  userId: uuidSchema.nullable(),
  email: z.string().email(),
  role: z.string().trim().min(1).nullable().optional(),
  organizationId: uuidSchema,
  establishmentId: uuidSchema,
  establishmentName: z.string().nullable(),
  status: z.enum(workforceUserStatuses),
  invitedAt: dateTimeSchema,
  invitationExpiresAt: dateTimeSchema,
  acceptedAt: dateTimeSchema.nullable(),
  joinedAt: dateTimeSchema.nullable(),
  removedAt: dateTimeSchema.nullable(),
});

export const teamPageResourceSchema = z.object({
  content: z.array(workforceUserResourceSchema),
  number: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  first: z.boolean(),
  last: z.boolean(),
  numberOfElements: z.number().int().nonnegative(),
  empty: z.boolean(),
});

export const invitationCreatedResourceSchema = z.object({
  id: uuidSchema,
});

export const invitationPreviewResourceSchema = z.object({
  organizationId: uuidSchema,
  organizationName: z.string().min(1),
  establishmentId: uuidSchema,
  establishmentName: z.string().min(1),
  maskedEmail: z.string().min(1),
  status: z.enum(["PENDING", "ACCEPTED", "REMOVED"]),
  expiresAt: dateTimeSchema,
});

export const invitationAcceptanceResourceSchema = z.object({
  membership: z.object({
    id: uuidSchema,
  }),
  alreadyMember: z.boolean(),
});

export const workforceAccessResourceSchema = z.object({
  active: z.boolean(),
  establishments: z.array(z.object({
    organizationId: uuidSchema,
    organizationName: z.string().min(1),
    establishmentId: uuidSchema,
    establishmentName: z.string().min(1),
  })),
});
