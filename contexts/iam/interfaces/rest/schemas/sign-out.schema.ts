import { z } from "zod";

export const signOutSchema = z.object({
  accessToken: z.string().min(1).optional(),
  refreshToken: z.string().min(1),
});
