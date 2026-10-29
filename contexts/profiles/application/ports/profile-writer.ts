import type { ProfileViewModel } from "../services/profile.view-model";
import type { UpdateProfileCommand } from "../../domain/model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../../domain/model/commands/update-profile-preferences.command";
import type { CreateProfileCommand } from "../model/create-profile.command";

/**
 * Server-only writer for the current user's profile and preferences.
 * Implementation is injected via composition; Domain has no dependency on
 * Infrastructure.
 */
export interface ProfileWriter {
  createProfile(command: CreateProfileCommand, token: string): Promise<ProfileViewModel>;
  updateProfile(command: UpdateProfileCommand, token: string): Promise<ProfileViewModel>;
  updatePreferences(
    command: UpdateProfilePreferencesCommand,
    token: string,
  ): Promise<ProfileViewModel>;
}
