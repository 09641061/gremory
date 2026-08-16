import { describe, expect, it } from "vitest";

import {
  groupPermissions,
  permissionGroupPriority,
  permissionLabel,
} from "@/contexts/workforce/interfaces/components/permissions/permissions.utils";

describe("permissions utils", () => {
  it("renders workforce as Team for the UI", () => {
    expect(groupPermissions(["workforce:read", "workforce:manage"])).toEqual([
      {
        context: "workforce",
        label: "Team",
        permissions: ["workforce:read", "workforce:manage"],
      },
    ]);
  });

  it("renders business as Organization for the UI", () => {
    expect(groupPermissions(["business:read", "business:manage"])).toEqual([
      {
        context: "business",
        label: "Organization",
        permissions: ["business:read", "business:manage"],
      },
    ]);
  });

  it("keeps Organization first in the permission hierarchy", () => {
    expect(permissionGroupPriority("business")).toBeLessThan(permissionGroupPriority("workforce"));
    expect(permissionGroupPriority("workforce")).toBeLessThan(permissionGroupPriority("scheduling"));
  });

  it("keeps other permission groups readable", () => {
    expect(groupPermissions(["scheduling:read"])).toEqual([
      {
        context: "scheduling",
        label: "Scheduling",
        permissions: ["scheduling:read"],
      },
    ]);
  });

  it("keeps permission actions human-readable", () => {
    expect(permissionLabel("workforce:manage")).toBe("Manage");
    expect(permissionLabel("workforce:manage_members")).toBe("Manage Members");
  });
});
