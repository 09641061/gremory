import { z } from "zod";
import {
  MAX_ESTABLISHMENT_NAME_LENGTH,
  MIN_ESTABLISHMENT_NAME_LENGTH,
  ESTABLISHMENT_NAME_REGEX,
} from "@/contexts/business/domain/model/valueobjects/establishment-name.vo";

export const createEstablishmentSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z
    .string()
    .trim()
    .min(1, "Establishment name is required")
    .min(
      MIN_ESTABLISHMENT_NAME_LENGTH,
      `Establishment name must be at least ${MIN_ESTABLISHMENT_NAME_LENGTH} characters`
    )
    .max(
      MAX_ESTABLISHMENT_NAME_LENGTH,
      `Establishment name must be at most ${MAX_ESTABLISHMENT_NAME_LENGTH} characters`
    )
    .regex(ESTABLISHMENT_NAME_REGEX, "Establishment name must contain only letters (A-Z, a-z)"),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  timeZone: z.string().trim().min(1, "Time zone is required").max(100),
});

export const updateEstablishmentSchema = z.object({
  id: z.string().uuid("Invalid establishment ID"),
  name: z
    .string()
    .trim()
    .min(1, "Establishment name is required")
    .min(
      MIN_ESTABLISHMENT_NAME_LENGTH,
      `Establishment name must be at least ${MIN_ESTABLISHMENT_NAME_LENGTH} characters`
    )
    .max(
      MAX_ESTABLISHMENT_NAME_LENGTH,
      `Establishment name must be at most ${MAX_ESTABLISHMENT_NAME_LENGTH} characters`
    )
    .regex(ESTABLISHMENT_NAME_REGEX, "Establishment name must contain only letters (A-Z, a-z)"),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  timeZone: z.string().trim().min(1, "Time zone is required").max(100).optional().nullable(),
  ownerAvailableForScheduling: z.boolean().optional(),
});

export const deleteEstablishmentSchema = z.object({
  id: z.string().uuid("Invalid establishment ID"),
});

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;

export const establishmentResponseSchema = z.object({
  id: z.string().min(1), organizationId: z.string().min(1), name: z.string().min(1),
  photoUrl: z.string().nullable(), timeZone: z.string().nullable(),
  // Older business API responses do not include this field; the aggregate defaults it to true.
  ownerAvailableForScheduling: z.boolean().optional(),
});

export const whatsappStatusResponseSchema = z.object({
  establishmentId: z.string().uuid(),
  connected: z.boolean(),
  status: z.string().nullable().optional(),
  displayPhoneNumber: z.string().nullable().optional(),
  wabaId: z.string().nullable().optional(),
  phoneNumberId: z.string().nullable().optional(),
});

export const connectWhatsappSchema = z.object({
  establishmentId: z.string().uuid("Invalid establishment ID"),
  code: z.string().trim().min(1, "Authorization code is required"),
  wabaId: z.string().trim().optional().nullable(),
  phoneNumberId: z.string().trim().optional().nullable(),
});

export const disconnectWhatsappSchema = z.object({
  establishmentId: z.string().uuid("Invalid establishment ID"),
});

export type WhatsappStatusResponse = z.infer<typeof whatsappStatusResponseSchema>;
export type ConnectWhatsappInput = z.infer<typeof connectWhatsappSchema>;
export type DisconnectWhatsappInput = z.infer<typeof disconnectWhatsappSchema>;
