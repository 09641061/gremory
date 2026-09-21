import type { ProfileWriter } from "../../ports/profile-writer";
import type { UpdateProfileCommand } from "../../../domain/model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../../../domain/model/commands/update-profile-preferences.command";
import type { ProfileCommandService } from "../../services/profile-command.service";
import type { ProfileViewModel } from "../../services/profile.view-model";

/**
 * Pure handler: receives the writer port via constructor injection. No
 * `server-only`, no Infrastructure import, no token singleton.
 */
export class ProfileCommandServiceImpl implements ProfileCommandService {
  constructor(private readonly profileWriter: ProfileWriter) {}

  updateProfile(command: UpdateProfileCommand, token: string): Promise<ProfileViewModel> {
    return this.profileWriter.updateProfile(command, token);
  }

  updatePreferences(
    command: UpdateProfilePreferencesCommand,
    token: string,
  ): Promise<ProfileViewModel> {
    return this.profileWriter.updatePreferences(command, token);
  }
}
