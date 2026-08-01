import type { Profile } from "../model/entities/profile";
import type { UpdateProfileCommand } from "../model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../model/commands/update-profile-preferences.command";

export interface ProfileRepository {
  getMyProfile(accessToken: string): Promise<Profile | null>;
  updateProfile(command: UpdateProfileCommand, accessToken: string): Promise<Profile>;
  updatePreferences(command: UpdateProfilePreferencesCommand, accessToken: string): Promise<Profile>;
}
