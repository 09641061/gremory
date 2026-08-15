import { describe, expect, it } from "vitest";

import { groupPermissions, permissionLabel } from "@/contexts/workforce/interfaces/components/permissions/permissions.utils";

describe("permissions utils", () => {
  it("renders workforce as Team for the UI", () => {
    expect(groupPermissions(["workforce:read", "workforce:manage"])).toEqual([
      {
        label: "Team",
        permissions: ["workforce:read", "workforce:manage"],
      },
    ]);
  });

  it("renders business as Organization for the UI", () => {
    expect(groupPermissions(["business:read", "business:manage"])).toEqual([
      {
        label: "Organization",
        permissions: ["business:read", "business:manage"],
      },
    ]);
  });

  it("keeps other permission groups readable", () => {
    expect(groupPermissions(["scheduling:read"])).toEqual([
      {
        label: "Scheduling",
        permissions: ["scheduling:read"],
      },
    ]);
  });

  it("keeps permission actions human-readable", () => {
    expect(permissionLabel("workforce:manage")).toBe("Manage");
  });
});
