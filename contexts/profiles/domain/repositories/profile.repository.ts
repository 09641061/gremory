import type { UpdateProfileCommand } from "../model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../model/commands/update-profile-preferences.command";
import type { ProfileViewModel } from "../../application/services/profile.view-model";

export interface ProfileRepository {
  getMyProfile(accessToken: string): Promise<ProfileViewModel | null>;
  updateProfile(command: UpdateProfileCommand, accessToken: string): Promise<ProfileViewModel>;
  updatePreferences(command: UpdateProfilePreferencesCommand, accessToken: string): Promise<ProfileViewModel>;
}
