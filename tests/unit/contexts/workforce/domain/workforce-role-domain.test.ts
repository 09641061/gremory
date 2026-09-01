import { describe, expect, it } from "vitest";
import { WorkforceRole } from "@/contexts/workforce/domain/model/entities/workforce-role.entity";
import {
  workforceAssignablePermissions,
  workforcePermissionCodes,
  isWorkforcePermission,
  isWorkforceAssignablePermission,
} from "@/contexts/workforce/domain/model/enums/workforce-permission";

describe("Workforce role domain", () => {
  it("should normalize name and permissions when creating a role", () => {
    const role = WorkforceRole.create({
      name: "  Catalog Manager  ",
      permissions: ["catalog:manage", "establishment:read"],
      systemRole: false,
    });

    expect(role.id).toBeNull();
    expect(role.getName()).toBe("Catalog Manager");
    expect(role.getPermissions()).toEqual([
      "catalog:manage",
      "establishment:read",
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
    expect(workforcePermissionCodes).toHaveLength(20);
    expect(new Set(workforcePermissionCodes)).toHaveLength(20);
    expect(workforcePermissionCodes).toContain("establishment:read");
    expect(workforcePermissionCodes).toContain("analytics:read");
    expect(workforcePermissionCodes).toContain("assistant:manage");
    expect(workforcePermissionCodes).toContain("workforce:invite");
    expect(workforcePermissionCodes).toContain("workforce:manage_members");
    expect(workforcePermissionCodes).toContain("workforce:manage_roles");
    expect(isWorkforcePermission("catalog:manage")).toBe(true);
    expect(isWorkforcePermission("not-supported")).toBe(false);
  });

  it("should expose exactly the assignable permissions the backend accepts", () => {
    expect(workforceAssignablePermissions).toEqual([
      "scheduling:read",
      "scheduling:manage",
      "availability:manage_self",
      "availability:manage_all",
      "catalog:read",
      "catalog:manage",
      "crm:read",
      "crm:manage",
      "workforce:read",
      "workforce:manage",
      "analytics:read",
      "assistant:manage",
      "establishment:update",
    ]);
    expect(isWorkforceAssignablePermission("scheduling:manage")).toBe(true);
    expect(isWorkforceAssignablePermission("analytics:read")).toBe(true);
    expect(isWorkforceAssignablePermission("assistant:manage")).toBe(true);
    expect(isWorkforceAssignablePermission("establishment:read")).toBe(false);
    expect(isWorkforceAssignablePermission("workforce:invite")).toBe(false);
  });
});
