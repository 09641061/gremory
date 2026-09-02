import { describe, expect, it } from "vitest";
import {
  updateProfileSchema,
  updatePreferencesSchema,
  profileResponseSchema,
} from "@/contexts/profiles/interfaces/rest/schemas/profile.schemas";

describe("Profile Validation Schemas", () => {
  it("should validate a correct profile payload when username and image are valid", () => {
    const result = updateProfileSchema.safeParse({
      username: "mateo",
      imageUrl: "https://picsum.photos/seed/replik-test/800/600",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe("mateo");
      expect(result.data.imageUrl).toBe("https://picsum.photos/seed/replik-test/800/600");
    }
  });

  it("should trim username whitespace and allow empty image URL", () => {
    const result = updateProfileSchema.safeParse({
      username: "  JohnDoe  ",
      imageUrl: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe("JohnDoe");
    }
  });

  it("should reject username when it contains non-letter characters", () => {
    const result = updateProfileSchema.safeParse({
      username: "mateo_123",
      imageUrl: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Username must contain only letters (A-Z, a-z)");
    }
  });

  it("should reject username when it is shorter than 3 characters", () => {
    const result = updateProfileSchema.safeParse({
      username: "ab",
      imageUrl: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Username must be at least 3 characters");
    }
  });

  it("should reject username when it is longer than 20 characters", () => {
    const result = updateProfileSchema.safeParse({
      username: "a".repeat(21),
      imageUrl: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Username must be at most 20 characters");
    }
  });

  it("should allow relative image path or URL format", () => {
    const result = updateProfileSchema.safeParse({
      username: "mateo",
      imageUrl: "images/profiles/avatar.png",
    });

    expect(result.success).toBe(true);
  });

  it("should reject image URL exceeding maximum length", () => {
    const result = updateProfileSchema.safeParse({
      username: "mateo",
      imageUrl: "https://example.com/" + "a".repeat(1000),
    });

    expect(result.success).toBe(false);
  });

  describe("updatePreferencesSchema", () => {
    it("should accept valid language and theme combinations", () => {
      const result = updatePreferencesSchema.safeParse({
        language: "ES",
        theme: "DARK",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.language).toBe("ES");
        expect(result.data.theme).toBe("DARK");
      }
    });

    it("should reject invalid language", () => {
      const result = updatePreferencesSchema.safeParse({
        language: "FR",
        theme: "LIGHT",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid theme", () => {
      const result = updatePreferencesSchema.safeParse({
        language: "EN",
        theme: "BLUE",
      });

      expect(result.success).toBe(false);
    });

    it("should reject SYSTEM because the backend only supports explicit themes", () => {
      const result = updatePreferencesSchema.safeParse({
        language: "EN",
        theme: "SYSTEM",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("profileResponseSchema", () => {
    it("should parse valid profile response payload", () => {
      const result = profileResponseSchema.safeParse({
        username: "Alice",
        imageUrl: "https://picsum.photos/seed/replik-test/800/600",
        language: "EN",
        theme: "LIGHT",
      });

      expect(result.success).toBe(true);
    });

    it("should allow null or undefined imageUrl in response", () => {
      const result = profileResponseSchema.safeParse({
        username: "Alice",
        imageUrl: null,
        language: "ES",
        theme: "LIGHT",
      });

      expect(result.success).toBe(true);
    });
  });
});
