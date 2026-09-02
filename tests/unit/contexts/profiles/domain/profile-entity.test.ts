import { describe, expect, it } from "vitest";
import { Profile } from "@/contexts/profiles/domain/model/entities/profile";
import { createProfileId } from "@/contexts/profiles/domain/model/valueobjects/profile-id";
import { createUserId } from "@/contexts/profiles/domain/model/valueobjects/user-id";
import { createUsername } from "@/contexts/profiles/domain/model/valueobjects/username";
import { createProfileImageUrl } from "@/contexts/profiles/domain/model/valueobjects/profile-image-url";
import {
  createProfilePreferences,
  defaultProfilePreferences,
} from "@/contexts/profiles/domain/model/valueobjects/profile-preferences";

describe("Profile Entity", () => {
  const profileId = createProfileId("p-1");
  const userId = createUserId("u-1");
  const username = createUsername("mateo");
  const imageUrl = createProfileImageUrl("https://example.com/avatar.jpg");
  const preferences = defaultProfilePreferences();
  const createdAt = "2026-01-01T00:00:00.000Z";
  const updatedAt = "2026-01-01T00:00:00.000Z";

  it("should instantiate a profile with correct initial attributes", () => {
    // Arrange & Act
    const profile = Profile.create(
      profileId,
      userId,
      username,
      imageUrl,
      preferences,
      createdAt,
      updatedAt
    );

    // Assert
    expect(profile.id).toBe(profileId);
    expect(profile.userId).toBe(userId);
    expect(profile.username).toBe(username);
    expect(profile.imageUrl).toBe(imageUrl);
    expect(profile.preferences).toBe(preferences);
    expect(profile.createdAt).toBe(createdAt);
    expect(profile.updatedAt).toBe(updatedAt);
  });

  it("should update profile details and refresh updatedAt timestamp", () => {
    // Arrange
    const profile = Profile.create(
      profileId,
      userId,
      username,
      imageUrl,
      preferences,
      createdAt,
      updatedAt
    );
    const newUsername = createUsername("alex");
    const newImageUrl = createProfileImageUrl("https://example.com/new.jpg");

    // Act
    profile.updateDetails(newUsername, newImageUrl);

    // Assert
    expect(profile.username.value).toBe("alex");
    expect(profile.imageUrl.value).toBe("https://example.com/new.jpg");
    expect(profile.updatedAt).not.toBe(updatedAt);
  });

  it("should update profile preferences and refresh updatedAt timestamp", () => {
    // Arrange
    const profile = Profile.create(
      profileId,
      userId,
      username,
      imageUrl,
      preferences,
      createdAt,
      updatedAt
    );
    const newPrefs = createProfilePreferences("EN", "DARK");

    // Act
    profile.updatePreferences(newPrefs);

    // Assert
    expect(profile.preferences.language).toBe("EN");
    expect(profile.preferences.theme).toBe("DARK");
    expect(profile.updatedAt).not.toBe(updatedAt);
  });
});
