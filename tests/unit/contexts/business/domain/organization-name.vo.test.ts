import { describe, it, expect } from "vitest";
import {
  createOrganizationName,
  MIN_ORGANIZATION_NAME_LENGTH,
  MAX_ORGANIZATION_NAME_LENGTH,
} from "@/contexts/business/domain/model/valueobjects/organization-name.vo";

describe("OrganizationName Value Object", () => {
  it("should create organization name when value is valid letters only (3-20 chars)", () => {
    const vo = createOrganizationName("AcmeCorp");
    expect(vo.value).toBe("AcmeCorp");
  });

  it("should trim surrounding whitespace when creating valid organization name", () => {
    const vo = createOrganizationName("   Acme   ");
    expect(vo.value).toBe("Acme");
  });

  it("should throw error when value is empty or only whitespace", () => {
    expect(() => createOrganizationName("")).toThrow("Organization name is required");
    expect(() => createOrganizationName("   ")).toThrow("Organization name is required");
  });

  it("should throw error when value has fewer than 3 characters", () => {
    expect(() => createOrganizationName("Ac")).toThrow(
      `Organization name must be between ${MIN_ORGANIZATION_NAME_LENGTH} and ${MAX_ORGANIZATION_NAME_LENGTH} characters`
    );
  });

  it("should throw error when value has more than 20 characters", () => {
    const longName = "a".repeat(21);
    expect(() => createOrganizationName(longName)).toThrow(
      `Organization name must be between ${MIN_ORGANIZATION_NAME_LENGTH} and ${MAX_ORGANIZATION_NAME_LENGTH} characters`
    );
  });

  it("should throw error when value contains numbers, spaces, accents or symbols", () => {
    const invalidNames = [
      "Acme 123",
      "AcmeCorp1",
      "Organización",
      "Org_Name",
      "Acme-Corp",
      "Acme!",
      "Company Name",
    ];

    for (const invalid of invalidNames) {
      expect(() => createOrganizationName(invalid)).toThrow(
        "Organization name must contain only letters (A-Z, a-z)"
      );
    }
  });
});
