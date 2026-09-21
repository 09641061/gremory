import type { ProfileReader } from "../../ports/profile-reader";
import type { GetMyProfileQuery } from "../../../domain/model/queries/get-my-profile.query";
import type { ProfileQueryService } from "../../services/profile-query.service";
import type { ProfileViewModel } from "../../services/profile.view-model";

/**
 * Pure handler: receives the reader port via constructor injection.
 */
export class ProfileQueryServiceImpl implements ProfileQueryService {
  constructor(private readonly profileReader: ProfileReader) {}

  getMyProfile(_query: GetMyProfileQuery, token: string): Promise<ProfileViewModel | null> {
    return this.profileReader.getMyProfile(token);
  }
}
