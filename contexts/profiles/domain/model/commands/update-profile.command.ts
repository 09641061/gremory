import type { Username } from "../valueobjects/username";
import type { ProfileImageUrl } from "../valueobjects/profile-image-url";

export type UpdateProfileCommand = {
  username: Username;
  imageUrl: ProfileImageUrl;
};
