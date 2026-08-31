import { z } from "zod";

export const requestEmailSignInSchema = z.object({
  email: z.string().trim().email(),
});

export const confirmEmailSignInSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{6}$/, "The verification code must have 6 digits"),
});

export const authenticationSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
