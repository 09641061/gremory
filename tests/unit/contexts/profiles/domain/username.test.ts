import { describe, it, expect } from "vitest";
import {
  createUsername,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from "@/contexts/profiles/domain/model/valueobjects/username";

describe("Username Value Object", () => {
  it("should create username when value is valid letters only (3-20 chars)", () => {
    const vo = createUsername("John");
    expect(vo.value).toBe("John");
  });

  it("should trim surrounding whitespace when creating valid username", () => {
    const vo = createUsername("   John   ");
    expect(vo.value).toBe("John");
  });

  it("should throw error when value is empty or only whitespace", () => {
    expect(() => createUsername("")).toThrow("Username is required");
    expect(() => createUsername("   ")).toThrow("Username is required");
  });

  it("should throw error when value has fewer than 3 characters", () => {
    expect(() => createUsername("Jo")).toThrow(
      `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`
    );
  });

  it("should throw error when value has more than 20 characters", () => {
    const longName = "a".repeat(21);
    expect(() => createUsername(longName)).toThrow(
      `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`
    );
  });

  it("should throw error when value contains numbers, spaces, accents or symbols", () => {
    const invalidUsernames = [
      "John123",
      "John Doe",
      "María",
      "User_Name",
      "John-Doe",
      "Admin!",
    ];

    for (const invalid of invalidUsernames) {
      expect(() => createUsername(invalid)).toThrow(
        "Username must contain only letters (A-Z, a-z)"
      );
    }
  });
});
