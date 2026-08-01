import type { ProfileRepository } from "../../../domain/repositories/profile.repository";
import type { GetMyProfileQuery } from "../../../domain/model/queries/get-my-profile.query";
import type { ProfileQueryService } from "../../services/profile-query.service";
import type { ProfileViewModel } from "../../services/profile.view-model";

export class ProfileQueryServiceImpl implements ProfileQueryService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getMyProfile(
    _query: GetMyProfileQuery,
    accessToken: string
  ): Promise<ProfileViewModel | null> {
    return this.profileRepository.getMyProfile(accessToken);
  }
}
