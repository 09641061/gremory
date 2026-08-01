import type { Profile } from "../../domain/model/entities/profile";

export type ProfileViewModel = Readonly<{
  id: string;
  userId: string;
  username: string;
  imageUrl: string | null;
  preferences: Readonly<{
    language: "ES" | "EN";
    theme: "LIGHT" | "DARK" | "SYSTEM";
  }>;
  createdAt: string;
  updatedAt: string;
}>;

export function toProfileViewModel(profile: Profile): ProfileViewModel {
  return Object.freeze({
    id: profile.id.value,
    userId: profile.userId.value,
    username: profile.username.value,
    imageUrl: profile.imageUrl.value,
    preferences: Object.freeze({
      language: profile.preferences.language,
      theme: profile.preferences.theme,
    }),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  });
}
