import type { UpdateProfileCommand } from "../../domain/model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../../domain/model/commands/update-profile-preferences.command";
import type { ProfileViewModel } from "./profile.view-model";
import type { CreateProfileCommand } from "../model/create-profile.command";

export interface ProfileCommandService {
  createProfile(command: CreateProfileCommand, accessToken: string): Promise<ProfileViewModel>;
  updateProfile(command: UpdateProfileCommand, accessToken: string): Promise<ProfileViewModel>;
  updatePreferences(
    command: UpdateProfilePreferencesCommand,
    accessToken: string
  ): Promise<ProfileViewModel>;
}
