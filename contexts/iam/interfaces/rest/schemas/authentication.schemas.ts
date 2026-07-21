import { z } from 'zod'

export const emailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

export const confirmEmailSchema = emailSchema.extend({
  code: z.string().trim().regex(/^\d{6}$/, 'The code must contain 6 digits.'),
})

export const magicLinkSchema = z.object({
  token: z.string().trim().min(1, 'The access link is invalid.'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})
