import { z } from "zod";

export const requestEmailSignInSchema = z.object({
  email: z.string().trim().email(),
});

export const confirmEmailSignInSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{6}$/, "The verification code must have 6 digits"),
});
