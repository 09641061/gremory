import { z } from "zod";

export const signOutSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
