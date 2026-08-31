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

  it("renders establishments as Establishments for the UI", () => {
    expect(groupPermissions(["establishment:read", "establishment:update"])).toEqual([
      {
        context: "establishment",
        label: "Establishments",
        permissions: ["establishment:read", "establishment:update"],
      },
    ]);
  });

  it("orders modules as the backend contract suggests", () => {
    expect(permissionGroupPriority("scheduling")).toBeLessThan(permissionGroupPriority("catalog"));
    expect(permissionGroupPriority("catalog")).toBeLessThan(permissionGroupPriority("crm"));
    expect(permissionGroupPriority("crm")).toBeLessThan(permissionGroupPriority("workforce"));
    expect(permissionGroupPriority("workforce")).toBeLessThan(permissionGroupPriority("analytics"));
    expect(permissionGroupPriority("analytics")).toBeLessThan(permissionGroupPriority("establishment"));
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
