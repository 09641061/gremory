import { z } from "zod";

export const profileResponseSchema = z.object({
  username: z.string(),
  imageUrl: z.string().nullable().optional(),
  language: z.enum(["ES", "EN"]),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
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
