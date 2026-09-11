/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthorizationResource } from "@/contexts/workforce/application/model/user-session";
import { RoleManagement } from "@/contexts/workforce/interfaces/components/role-management";
import { WorkspaceAuthProvider } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";
import { workforceRolePermissionCatalog } from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

const organizationId = "11111111-1111-4111-8111-111111111111";
const authorization: AuthorizationResource = {
  accountType: "MEMBER",
  scope: { type: "ORGANIZATION", organizationId, establishmentId: null },
  roles: [],
  effectivePermissions: ["workforce:manage_roles"],
};

function renderManagement(permissions = authorization.effectivePermissions) {
  return render(
    <WorkspaceAuthProvider authorization={{ ...authorization, effectivePermissions: permissions }}>
      <RoleManagement />
    </WorkspaceAuthProvider>,
  );
}

describe("RoleManagement", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("blocks the page and does not fetch roles without manage_roles", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderManagement([]);

    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders only the active five-permission matrix", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderManagement();

    expect(screen.getAllByRole("checkbox")).toHaveLength(workforceRolePermissionCatalog.length);
    for (const permission of workforceRolePermissionCatalog) {
      expect(screen.getByText(permission)).toBeVisible();
    }
    expect(screen.queryByText("workforce:manage_roles")).toBeNull();
  });

  it("disables every mutation control when editing a system role", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: "22222222-2222-4222-8222-222222222222",
      name: "Admin",
      permissions: ["workforce:read_members"],
      systemRole: true,
      position: 1,
    }]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderManagement();

    expect(await screen.findByText("Admin")).toBeVisible();
    expect(screen.getByRole("button", { name: "View" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Delete Admin" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "View" }));
    expect(await screen.findByRole("textbox", { name: "Role name" })).toBeDisabled();
    expect(screen.getAllByRole("checkbox")).toHaveLength(workforceRolePermissionCatalog.length);
    expect(screen.getAllByRole("checkbox").every((checkbox) => (checkbox as HTMLInputElement).disabled)).toBe(true);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });
});
