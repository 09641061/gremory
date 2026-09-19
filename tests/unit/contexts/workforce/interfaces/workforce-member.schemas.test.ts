import { describe, expect, it } from "vitest";

import {
  SEMANTIC_OWNER_ROLE_ID,
  normalizeRoleId,
  normalizeUuidOrNull,
  workforceRoleSchema,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

describe("workforce role schema", () => {
  it("accepts a semantic role id without rejecting the payload", () => {
    const parsed = workforceRoleSchema.parse({
      id: "semantic-role:owner",
      name: "Owner",
      position: 0,
      systemRole: true,
      permissions: ["*"],
    });

    expect(parsed.id).toBe("semantic-role:owner");
    expect(normalizeRoleId(parsed.id)).toBe(SEMANTIC_OWNER_ROLE_ID);
  });

  it("keeps an already valid UUID untouched", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(normalizeRoleId(id)).toBe(id);
  });

  it("falls back to a valid UUID for unknown semantic ids", () => {
    expect(normalizeRoleId("some:unknown-role")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("guards empty or invalid scope ids with null", () => {
    expect(normalizeUuidOrNull("")).toBeNull();
    expect(normalizeUuidOrNull(undefined)).toBeNull();
    expect(normalizeUuidOrNull("not-a-uuid")).toBeNull();
    expect(normalizeUuidOrNull("11111111-1111-4111-8111-111111111111")).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
  });
});
