import type { ProfileRepository } from "../../../domain/repositories/profile.repository";
import type { UpdateProfileCommand } from "../../../domain/model/commands/update-profile.command";
import type { UpdateProfilePreferencesCommand } from "../../../domain/model/commands/update-profile-preferences.command";
import type { ProfileCommandService } from "../../services/profile-command.service";
import type { ProfileViewModel } from "../../services/profile.view-model";

export class ProfileCommandServiceImpl implements ProfileCommandService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async updateProfile(
    command: UpdateProfileCommand,
    accessToken: string
  ): Promise<ProfileViewModel> {
    return this.profileRepository.updateProfile(command, accessToken);
  }

  async updatePreferences(
    command: UpdateProfilePreferencesCommand,
    accessToken: string
  ): Promise<ProfileViewModel> {
    return this.profileRepository.updatePreferences(command, accessToken);
  }
}
