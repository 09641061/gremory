import { describe, expect, it } from "vitest";
import { profileFromApiResponse } from "@/contexts/profiles/interfaces/rest/mappers/profile.mapper";

describe("Profile Mapper", () => {
  it("should map valid API response to ProfileViewModel", () => {
    const raw = {
      username: "mateo",
      imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      language: "ES",
      theme: "LIGHT",
    };

    const result = profileFromApiResponse(raw);

    expect(result).toEqual({
      username: "mateo",
      imageUrl: "https://picsum.photos/seed/replik-test/800/600",
      language: "ES",
      theme: "LIGHT",
    });
  });

  it("should normalize missing or undefined imageUrl to null", () => {
    const raw = {
      username: "alex",
      language: "EN",
      theme: "SYSTEM",
    };

    const result = profileFromApiResponse(raw);

    expect(result).toEqual({
      username: "alex",
      imageUrl: null,
      language: "EN",
      theme: "SYSTEM",
    });
  });

  it("should throw error when payload is missing required fields", () => {
    expect(() => profileFromApiResponse({})).toThrow();
  });
});
