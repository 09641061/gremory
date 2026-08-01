import type { ProfileViewModel } from "../../../application/services/profile.view-model";
import { profileResponseSchema } from "../schemas/profile.schemas";

export function profileFromApiResponse(data: unknown): ProfileViewModel {
  const parsed = profileResponseSchema.parse(data);

  return {
    username: parsed.username,
    imageUrl: parsed.imageUrl ?? null,
    language: parsed.language,
    theme: parsed.theme,
  };
}
