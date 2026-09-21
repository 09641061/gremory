import type { Username } from "../valueobjects/username";
import type { ProfileImageUrl } from "../valueobjects/profile-image-url";

/**
 * Transport-neutral image payload carried by the command. The Domain layer
 * must not depend on the Web `File` type; Infrastructure converts the browser
 * `File`/`FormData` into this shape at the edge.
 */
export type ProfileImageInput = Readonly<{
  name: string;
  type: string;
  size: number;
  bytes: Uint8Array;
}>;

export type UpdateProfileCommand = {
  username: Username;
  imageUrl: ProfileImageUrl;
  imageFile?: ProfileImageInput | null;
};
