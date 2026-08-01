import type { ProfileRepository } from "../../../domain/repositories/profile.repository";
import type { GetMyProfileQuery } from "../../../domain/model/queries/get-my-profile.query";
import type { ProfileQueryService } from "../../services/profile-query.service";
import { type ProfileViewModel, toProfileViewModel } from "../../services/profile.view-model";

export class ProfileQueryServiceImpl implements ProfileQueryService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getMyProfile(
    _query: GetMyProfileQuery,
    accessToken: string
  ): Promise<ProfileViewModel | null> {
    const profile = await this.profileRepository.getMyProfile(accessToken);
    if (!profile) return null;
    return toProfileViewModel(profile);
  }
}
