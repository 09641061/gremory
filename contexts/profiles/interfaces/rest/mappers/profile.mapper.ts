import { z } from "zod";
import { Profile } from "../../../domain/model/entities/profile";
import { createProfileId } from "../../../domain/model/valueobjects/profile-id";
import { createUserId } from "../../../domain/model/valueobjects/user-id";
import { createUsername } from "../../../domain/model/valueobjects/username";
import { createProfileImageUrl } from "../../../domain/model/valueobjects/profile-image-url";
import { createProfilePreferences } from "../../../domain/model/valueobjects/profile-preferences";
import { createLanguage } from "../../../domain/model/valueobjects/language";
import { createTheme } from "../../../domain/model/valueobjects/theme";
import { profileResponseSchema } from "../schemas/profile.schemas";

export function profileFromApiResponse(data: unknown): Profile {
  const parsed = profileResponseSchema.parse(data);

  return Profile.create(
    createProfileId(parsed.id),
    createUserId(parsed.userId),
    createUsername(parsed.username),
    createProfileImageUrl(parsed.imageUrl),
    createProfilePreferences(
      createLanguage(parsed.preferences.language),
      createTheme(parsed.preferences.theme)
    ),
    parsed.createdAt,
    parsed.updatedAt
  );
}
