import { z } from "zod";
import {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  USERNAME_REGEX,
} from "@/contexts/profiles/domain/model/valueobjects/username";

export const profileResponseSchema = z.object({
  username: z.string(),
  imageUrl: z.string().nullable().optional(),
  language: z.enum(["ES", "EN"]),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
    .max(MAX_USERNAME_LENGTH, `Username must be at most ${MAX_USERNAME_LENGTH} characters`)
    .regex(USERNAME_REGEX, "Username must contain only letters (A-Z, a-z)"),
  imageUrl: z.string().url("Invalid image URL").nullable().optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePreferencesSchema = z.object({
  language: z.enum(["ES", "EN"], {
    message: "Language must be ES or EN",
  }),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"], {
    message: "Theme must be LIGHT, DARK, or SYSTEM",
  }),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
