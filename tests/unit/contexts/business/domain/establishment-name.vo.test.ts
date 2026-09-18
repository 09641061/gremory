import { describe, it, expect } from "vitest";
import {
  createEstablishmentName,
  MIN_ESTABLISHMENT_NAME_LENGTH,
  MAX_ESTABLISHMENT_NAME_LENGTH,
} from "@/contexts/business/domain/model/valueobjects/establishment-name.vo";

describe("EstablishmentName Value Object", () => {
  it("should create establishment name when value is valid letters only (3-20 chars)", () => {
    const vo = createEstablishmentName("Miraflores");
    expect(vo.value).toBe("Miraflores");
  });

  it("should trim surrounding whitespace when creating valid establishment name", () => {
    const vo = createEstablishmentName("   Miraflores   ");
    expect(vo.value).toBe("Miraflores");
  });

  it("should throw error when value is empty or only whitespace", () => {
    expect(() => createEstablishmentName("")).toThrow("Establishment name is required");
    expect(() => createEstablishmentName("   ")).toThrow("Establishment name is required");
  });

  it("should throw error when value has fewer than 3 characters", () => {
    expect(() => createEstablishmentName("Mi")).toThrow(
      `Establishment name must be between ${MIN_ESTABLISHMENT_NAME_LENGTH} and ${MAX_ESTABLISHMENT_NAME_LENGTH} characters`
    );
  });

  it("should throw error when value has more than 20 characters", () => {
    const longName = "a".repeat(21);
    expect(() => createEstablishmentName(longName)).toThrow(
      `Establishment name must be between ${MIN_ESTABLISHMENT_NAME_LENGTH} and ${MAX_ESTABLISHMENT_NAME_LENGTH} characters`
    );
  });

  it("should throw error when value contains numbers, spaces, accents or symbols", () => {
    const invalidNames = [
      "Branch 123",
      "Branch1",
      "Sede Centro",
      "Est_Name",
      "South-Branch",
      "Branch!",
      "South Branch",
    ];

    for (const invalid of invalidNames) {
      expect(() => createEstablishmentName(invalid)).toThrow(
        "Establishment name must contain only letters (A-Z, a-z)"
      );
    }
  });
});
