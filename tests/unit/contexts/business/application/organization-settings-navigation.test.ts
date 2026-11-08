import { describe, expect, it } from "vitest";

import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import {
  resolveOrganizationSettingsAccess,
  resolveOrganizationSettingsHome,
} from "@/contexts/business/application/services/organization-settings-navigation";

describe("organization settings navigation", () => {
  it("does not offer organization settings to a scheduling-only specialist", () => {
    const workspace = memberWorkspace(["scheduling:appointments:read"]);

    expect(resolveOrganizationSettingsAccess(workspace)).toEqual({
      organization: false,
      members: false,
      roles: false,
      invites: false,
      establishments: false,
    });
    expect(resolveOrganizationSettingsHome(workspace)).toBeUndefined();
  });

  it("offers only Members when the role can read the team", () => {
    const workspace = memberWorkspace(["workforce:members:read"]);

    expect(resolveOrganizationSettingsAccess(workspace)).toEqual({
      organization: false,
      members: true,
      roles: false,
      invites: false,
      establishments: false,
    });
    expect(resolveOrganizationSettingsHome(workspace)).toBe("/organization/members");
  });

  it("keeps the complete settings menu for the owner", () => {
    const workspace = { ...memberWorkspace([]), accountType: "OWNER" as const };

    expect(Object.values(resolveOrganizationSettingsAccess(workspace))).toEqual([
      true,
      true,
      true,
      true,
      true,
    ]);
    expect(resolveOrganizationSettingsHome(workspace)).toBe("/organization");
  });
});

function memberWorkspace(effectivePermissions: string[]): WorkspaceHeaderViewModel {
  return {
    accountType: "MEMBER",
    onboardingStatus: "COMPLETED",
    onboardingCompleted: true,
    ownedOrganizationId: null,
    organization: {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Takodu",
      canRead: true,
      canUpdate: false,
      canReadEstablishments: false,
      canCreateEstablishment: false,
    },
    establishments: [{
      id: "22222222-2222-4222-8222-222222222222",
      name: "Centro",
      effectivePermissions,
      canRead: false,
      canUpdate: false,
      canDelete: false,
    }],
    activeEstablishmentId: "22222222-2222-4222-8222-222222222222",
    canReadOrganization: true,
    canReadEstablishments: false,
    canCreateEstablishment: false,
    canCreateOrganization: true,
  };
}
