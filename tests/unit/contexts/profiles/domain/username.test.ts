import { describe, expect, it } from "vitest";
import {
  createUsername,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from "@/contexts/profiles/domain/model/valueobjects/username";

describe("Username Value Object", () => {
  it("should create a valid username when given valid letters within length boundaries", () => {
    // Arrange & Act
    const username = createUsername("mateo");

    // Assert
    expect(username.value).toBe("mateo");
    expect(Object.isFrozen(username)).toBe(true);
  });

  it("should trim surrounding whitespace when creating username", () => {
    // Arrange & Act
    const username = createUsername("  Alex  ");

    // Assert
    expect(username.value).toBe("Alex");
  });

  it("should reject creation when value is empty or only whitespace", () => {
    // Arrange & Act & Assert
    expect(() => createUsername("")).toThrow("Username is required");
    expect(() => createUsername("   ")).toThrow("Username is required");
  });

  it("should reject creation when value is shorter than the minimum length", () => {
    // Arrange & Act & Assert
    expect(() => createUsername("ab")).toThrow(
      `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`
    );
  });

  it("should reject creation when value is longer than the maximum length", () => {
    // Arrange & Act & Assert
    const longUsername = "a".repeat(MAX_USERNAME_LENGTH + 1);
    expect(() => createUsername(longUsername)).toThrow(
      `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`
    );
  });

  it("should reject creation when value contains numbers", () => {
    // Arrange & Act & Assert
    expect(() => createUsername("mateo123")).toThrow("Username must contain only letters (A-Z, a-z)");
  });

  it("should reject creation when value contains spaces", () => {
    // Arrange & Act & Assert
    expect(() => createUsername("mateo smith")).toThrow("Username must contain only letters (A-Z, a-z)");
  });

  it("should reject creation when value contains special characters or symbols", () => {
    // Arrange & Act & Assert
    expect(() => createUsername("mateo_dev")).toThrow("Username must contain only letters (A-Z, a-z)");
    expect(() => createUsername("mateo-test")).toThrow("Username must contain only letters (A-Z, a-z)");
    expect(() => createUsername("mateo@")).toThrow("Username must contain only letters (A-Z, a-z)");
  });

  it("should reject creation when value contains accented characters", () => {
    // Arrange & Act & Assert
    expect(() => createUsername("matéo")).toThrow("Username must contain only letters (A-Z, a-z)");
    expect(() => createUsername("josé")).toThrow("Username must contain only letters (A-Z, a-z)");
  });
});
