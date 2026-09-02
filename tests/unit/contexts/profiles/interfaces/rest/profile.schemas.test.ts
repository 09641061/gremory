import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/contexts/profiles/interfaces/rest/schemas/profile.schemas";

describe("Profile Validation Schemas", () => {
  it("should validate a correct profile payload when username and image are valid", () => {
    const result = updateProfileSchema.safeParse({
      username: "mateo",
      imageUrl: "https://example.com/avatar.png",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe("mateo");
      expect(result.data.imageUrl).toBe("https://example.com/avatar.png");
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

  it("should reject an invalid image URL format", () => {
    const result = updateProfileSchema.safeParse({
      username: "mateo",
      imageUrl: "not-a-valid-url",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Invalid image URL");
    }
  });
});
