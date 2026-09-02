import type { Username } from "../valueobjects/username";
import type { ProfileImageUrl } from "../valueobjects/profile-image-url";

export type ProfileImageFile = Readonly<{
  name: string;
  type: string;
  size: number;
}>;

export type UpdateProfileCommand = {
  username: Username;
  imageUrl: ProfileImageUrl;
  imageFile?: ProfileImageFile | null;
};
