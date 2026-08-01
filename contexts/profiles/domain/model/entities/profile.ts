import type { ProfileId } from "../valueobjects/profile-id";
import type { UserId } from "../valueobjects/user-id";
import { type Username, createUsername } from "../valueobjects/username";
import { type ProfileImageUrl, createProfileImageUrl } from "../valueobjects/profile-image-url";
import { type ProfilePreferences, createProfilePreferences } from "../valueobjects/profile-preferences";

export class Profile {
  private constructor(
    public readonly id: ProfileId,
    public readonly userId: UserId,
    private _username: Username,
    private _imageUrl: ProfileImageUrl,
    private _preferences: ProfilePreferences,
    public readonly createdAt: string,
    private _updatedAt: string
  ) {}

  static create(
    id: ProfileId,
    userId: UserId,
    username: Username,
    imageUrl: ProfileImageUrl,
    preferences: ProfilePreferences,
    createdAt: string,
    updatedAt: string
  ): Profile {
    return new Profile(id, userId, username, imageUrl, preferences, createdAt, updatedAt);
  }

  get username(): Username {
    return this._username;
  }

  get imageUrl(): ProfileImageUrl {
    return this._imageUrl;
  }

  get preferences(): ProfilePreferences {
    return this._preferences;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  updateDetails(newUsername: Username, newImageUrl: ProfileImageUrl): void {
    this._username = newUsername;
    this._imageUrl = newImageUrl;
    this._updatedAt = new Date().toISOString();
  }

  updatePreferences(newPreferences: ProfilePreferences): void {
    this._preferences = newPreferences;
    this._updatedAt = new Date().toISOString();
  }
}
