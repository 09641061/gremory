import { z } from "zod";

export const profileResponseSchema = z.object({
  username: z.string(),
  imageUrl: z.string().nullable().optional(),
  language: z.enum(["ES", "EN"]),
  theme: z.enum(["LIGHT", "DARK"]),
});
