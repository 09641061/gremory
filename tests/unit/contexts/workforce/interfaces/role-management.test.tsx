/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthorizationResource } from "@/contexts/workforce/application/model/user-session";
import { RoleManagement } from "@/contexts/workforce/interfaces/components/role-management";
import { WorkspaceAuthProvider } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";
import { workforceRolePermissionCatalog } from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "55555555-5555-4555-8555-555555555555";
const memberId = "33333333-3333-4333-8333-333333333333";
const authorization: AuthorizationResource = {
  accountType: "MEMBER",
  scope: { type: "ORGANIZATION", organizationId, establishmentId: null },
  roles: [],
  effectivePermissions: ["workforce:manage_roles"],
};

const workerRole = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  name: "Worker",
  position: 2,
  systemRole: false,
  permissions: [],
};

function memberWithRoles(roleIds: string[]) {
  return {
    invitationId: "99999999-9999-4999-8999-999999999999",
    memberId,
    userId: "44444444-4444-4444-8444-444444444444",
    email: "member@example.com",
    username: "Member User",
    imageUrl: null,
    organizationId,
    organizationName: "Takodu",
    establishmentId,
    establishmentName: "Main",
    status: "ACTIVE",
    roles: roleIds.map((id) => ({
      id,
      name: "Worker",
      position: 2,
      systemRole: false,
      permissions: [],
    })),
    invitedAt: "2026-01-01T00:00:00Z",
    invitationExpiresAt: "2026-02-01T00:00:00Z",
    acceptedAt: "2026-01-01T00:00:00Z",
    joinedAt: "2026-01-01T00:00:00Z",
    removedAt: null,
    isOwner: false,
  };
}

function mockApi({ roles = [], members = [] }: { roles?: unknown[]; members?: unknown[] } = {}) {
  return vi.fn((url: string, init?: RequestInit) => {
    if (init?.method === "PUT" || init?.method === "DELETE") {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (url.startsWith("/api/workforce/roles")) {
      return Promise.resolve(new Response(JSON.stringify(roles), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({
      content: members,
      page: 0,
      size: 100,
      totalElements: members.length,
      totalPages: 1,
    }), { status: 200 }));
  });
}

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

  it("shows the empty state by default and reveals the matrix on create", async () => {
    vi.stubGlobal("fetch", mockApi());

    renderManagement();

    expect(
      await screen.findByText(
        "Select an organization role from the list to view and manage its permissions.",
      ),
    ).toBeVisible();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: "Create new role" }));

    expect(screen.getAllByRole("checkbox")).toHaveLength(workforceRolePermissionCatalog.length);
    for (const permission of workforceRolePermissionCatalog) {
      expect(screen.getByText(permission)).toBeVisible();
    }
    expect(screen.queryByText("workforce:manage_roles")).toBeNull();
  });

  it("does not render a Permissions column in the roles table", async () => {
    vi.stubGlobal("fetch", mockApi({ roles: [workerRole], members: [] }));

    renderManagement();

    expect(await screen.findByText("Worker")).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Role" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.queryByRole("columnheader", { name: "Permissions" })).toBeNull();
  });

  it("returns to the empty state when Cancel is pressed while editing", async () => {
    vi.stubGlobal("fetch", mockApi({ roles: [workerRole], members: [] }));

    renderManagement();

    await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
    expect(await screen.findByRole("textbox", { name: "Role name" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      await screen.findByText(
        "Select an organization role from the list to view and manage its permissions.",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("textbox", { name: "Role name" })).toBeNull();
  });

  it("returns to the empty state when Cancel is pressed while creating", async () => {
    vi.stubGlobal("fetch", mockApi());

    renderManagement();

    await userEvent.click(await screen.findByRole("button", { name: "Create new role" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(workforceRolePermissionCatalog.length);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      await screen.findByText(
        "Select an organization role from the list to view and manage its permissions.",
      ),
    ).toBeVisible();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("shows how many members hold each role", async () => {
    vi.stubGlobal("fetch", mockApi({
      roles: [workerRole],
      members: [memberWithRoles([workerRole.id])],
    }));

    renderManagement();

    expect(await screen.findByText("Worker")).toBeVisible();
    expect(screen.getByText("(1)")).toBeVisible();
  });

  it("lists a role's members and removes one from the Members tab", async () => {
    const fetchMock = mockApi({
      roles: [workerRole],
      members: [memberWithRoles([workerRole.id])],
    });
    vi.stubGlobal("fetch", fetchMock);

    renderManagement();

    await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
    await userEvent.click(await screen.findByRole("tab", { name: "Members (1)" }));

    expect(screen.getByText("Member User")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: `Remove Member User from ${workerRole.name}` }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/roles/members/${memberId}/${workerRole.id}`,
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
  });

  it("adds a member to the role from the Members tab", async () => {
    const fetchMock = mockApi({
      roles: [workerRole],
      members: [memberWithRoles([])],
    });
    vi.stubGlobal("fetch", fetchMock);

    renderManagement();

    await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
    await userEvent.click(await screen.findByRole("tab", { name: "Members (0)" }));
    expect(await screen.findByText("0 members with this role")).toBeVisible();
    await userEvent.click(await screen.findByText("Add Members"));
    await userEvent.click(await screen.findByRole("option", { name: "Member User" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/roles/members/${memberId}`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ roleId: workerRole.id }),
        }),
      ),
    );
  });

  it("disables every mutation control when editing a system role", async () => {
    vi.stubGlobal("fetch", mockApi({
      roles: [{
        id: "22222222-2222-4222-8222-222222222222",
        name: "Admin",
        permissions: ["workforce:read_members"],
        systemRole: true,
        position: 1,
      }],
      members: [memberWithRoles([])],
    }));

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
