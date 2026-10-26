import { z } from "zod";

const uuid = z.string().uuid();
const instant = z.string().datetime({ offset: true });

export const workforceInvitationSchema = z.object({
  id: uuid,
  organizationId: uuid,
  organizationName: z.string().min(1),
  establishmentId: uuid,
  establishmentName: z.string().min(1),
  email: z.string().email(),
  status: z.literal("PENDING"),
  createdAt: instant,
  expiresAt: instant,
});

export const workforceInvitationListSchema = z.array(workforceInvitationSchema);

export const workforceInvitationPreviewSchema = z.object({
  organizationId: uuid,
  organizationName: z.string().min(1),
  establishmentId: uuid,
  establishmentName: z.string().min(1),
  maskedEmail: z.string().min(1),
  recipientRegistered: z.boolean(),
  expiresAt: instant,
});

export const workforceMemberSchema = z.object({
  id: uuid,
  organizationId: uuid,
  establishmentId: uuid,
  establishmentName: z.string().min(1),
  userId: uuid,
  email: z.string().email(),
  joinedAt: instant,
});

export const workforceMemberListSchema = z.array(workforceMemberSchema);

export const acceptedWorkforceInvitationSchema = z.object({
  organizationId: uuid,
  establishmentId: uuid,
});

export const inviteWorkforceMemberSchema = z.object({
  email: z.string().trim().email("Ingresa un correo electrónico válido.").max(254),
  establishmentId: uuid,
});

export const invitationTokenSchema = z.string().trim().min(1).max(512);
