import { z } from "zod";

export const profileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  username: z.string(),
  imageUrl: z.string().nullable().optional(),
  preferences: z.object({
    language: z.enum(["ES", "EN"]),
    theme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z]+$/, "Username must contain only letters (A-Z, a-z)"),
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
