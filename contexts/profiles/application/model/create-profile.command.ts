import type { ProfileImageUrl } from "../../domain/model/valueobjects/profile-image-url";
import type { Username } from "../../domain/model/valueobjects/username";

export type CreateProfileCommand = Readonly<{
  username: Username;
  imageUrl: ProfileImageUrl;
}>;
