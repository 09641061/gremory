import type { GetMyProfileQuery } from "../../domain/model/queries/get-my-profile.query";
import type { ProfileViewModel } from "./profile.view-model";

export interface ProfileQueryService {
  getMyProfile(query: GetMyProfileQuery, accessToken: string): Promise<ProfileViewModel | null>;
}
