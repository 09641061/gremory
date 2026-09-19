import { describe, expect, it } from "vitest";

import {
  createWorkforceRoleSchema,
  patchWorkforceRoleSchema,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

describe("role color contract", () => {
  it("accepts a hex color on create", () => {
    const parsed = createWorkforceRoleSchema.safeParse({
      name: "Supervisor",
      permissions: ["catalog:manage"],
      color: "#10B981",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.color).toBe("#10B981");
    }
  });

  it("accepts a color-only or combined patch payload", () => {
    expect(patchWorkforceRoleSchema.safeParse({ color: "#6366F1" }).success).toBe(true);
    expect(
      patchWorkforceRoleSchema.safeParse({ permissions: ["catalog:manage"], color: "#6366F1" }).success,
    ).toBe(true);
  });

  it("rejects an invalid color value", () => {
    expect(
      createWorkforceRoleSchema.safeParse({ name: "Supervisor", permissions: [], color: "Sky" }).success,
    ).toBe(false);
  });
});
