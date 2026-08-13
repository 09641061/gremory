import { describe, expect, it } from "vitest";
import { WorkforceRole } from "@/contexts/workforce/domain/model/entities/workforce-role.entity";
import {
  workforcePermissionCodes,
  isWorkforcePermission,
} from "@/contexts/workforce/domain/model/enums/workforce-permission";

describe("Workforce role domain", () => {
  it("should normalize name and permissions when creating a role", () => {
    const role = WorkforceRole.create({
      name: "  Catalog Manager  ",
      permissions: ["catalog:manage", "business:read"],
      systemRole: false,
    });

    expect(role.id).toBeNull();
    expect(role.getName()).toBe("Catalog Manager");
    expect(role.getPermissions()).toEqual([
      "catalog:manage",
      "business:read",
    ]);
  });

  it("should reject an empty role name", () => {
    expect(() =>
      WorkforceRole.create({
        name: "   ",
        permissions: ["catalog:manage"],
        systemRole: false,
      }),
    ).toThrow("Role name is required");
  });

  it("should expose the supported workforce permissions", () => {
    expect(workforcePermissionCodes).toHaveLength(10);
    expect(new Set(workforcePermissionCodes)).toHaveLength(10);
    expect(workforcePermissionCodes).toContain("business:read");
    expect(isWorkforcePermission("catalog:manage")).toBe(true);
    expect(isWorkforcePermission("not-supported")).toBe(false);
  });
});
