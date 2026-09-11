/** @vitest-environment jsdom */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthorizationResource } from "@/contexts/workforce/application/model/user-session";
import { TeamRoster } from "@/contexts/workforce/interfaces/components/team-roster";
import { WorkspaceAuthProvider } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "55555555-5555-4555-8555-555555555555";
const authorization: AuthorizationResource = {
  accountType: "MEMBER",
  scope: { type: "ORGANIZATION", organizationId, establishmentId: null },
  roles: [],
  effectivePermissions: ["workforce:read_members", "workforce:assign_roles", "workforce:manage_members"],
};

function renderRoster(
  permissions = authorization.effectivePermissions,
  establishmentOverride: string | null = establishmentId,
) {
  return render(
    <WorkspaceAuthProvider authorization={{ ...authorization, effectivePermissions: permissions }}>
      <TeamRoster establishmentId={establishmentOverride} />
    </WorkspaceAuthProvider>,
  );
}

function emptyRosterResponse() {
  return new Response(JSON.stringify({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  }), { status: 200 });
}

describe("TeamRoster", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not request roster data without workforce:read_members", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderRoster([]);

    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never renders mutation controls for an Owner row", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      content: [{
        invitationId: "22222222-2222-4222-8222-222222222222",
        memberId: "33333333-3333-4333-8333-333333333333",
        userId: "44444444-4444-4444-8444-444444444444",
        email: "owner@example.com",
        username: "Organization Owner",
        imageUrl: null,
        organizationId,
        organizationName: "Takodu",
        establishmentId: "55555555-5555-4555-8555-555555555555",
        establishmentName: "Main",
        status: "ACTIVE",
        roles: [{
          id: "66666666-6666-4666-8666-666666666666",
          name: "Owner",
          position: 0,
          systemRole: true,
          permissions: ["*"],
        }],
        invitedAt: "2026-01-01T00:00:00Z",
        invitationExpiresAt: "2026-02-01T00:00:00Z",
        acceptedAt: "2026-01-01T00:00:00Z",
        joinedAt: "2026-01-01T00:00:00Z",
        removedAt: null,
        isOwner: true,
      }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderRoster();

    expect(await screen.findByText("Organization Owner")).toBeVisible();
    expect(screen.getByText("Protected")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Roles" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove" })).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workforce/members?page=0&size=20",
      expect.objectContaining({ headers: { "X-Organization-Id": organizationId } }),
    );
  });

  it("lists pending invitations with their email and sent date", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      content: [{
        invitationId: "99999999-9999-4999-8999-999999999999",
        memberId: null,
        userId: null,
        email: "pending@example.com",
        username: null,
        imageUrl: null,
        organizationId,
        organizationName: "Takodu",
        establishmentId,
        establishmentName: "Main",
        status: "PENDING",
        roles: [],
        invitedAt: "2026-01-15T00:00:00Z",
        invitationExpiresAt: "2026-02-15T00:00:00Z",
        acceptedAt: null,
        joinedAt: null,
        removedAt: null,
        isOwner: false,
      }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    }), { status: 200 })));

    renderRoster();

    await userEvent.click(await screen.findByRole("tab", { name: "Pending Invitations (1)" }));

    expect(await screen.findByText("pending@example.com")).toBeVisible();
    expect(screen.getByText(/Sent/)).toBeVisible();
  });

  it("shows the pending invitations count on the tab and unmounts the members table", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      content: [{
        invitationId: "99999999-9999-4999-8999-999999999999",
        memberId: "33333333-3333-4333-8333-333333333333",
        userId: "44444444-4444-4444-8444-444444444444",
        email: "member@example.com",
        username: "Member User",
        imageUrl: null,
        organizationId,
        organizationName: "Takodu",
        establishmentId,
        establishmentName: "Main",
        status: "ACTIVE",
        roles: [],
        invitedAt: "2026-01-01T00:00:00Z",
        invitationExpiresAt: "2026-02-01T00:00:00Z",
        acceptedAt: "2026-01-01T00:00:00Z",
        joinedAt: "2026-01-01T00:00:00Z",
        removedAt: null,
        isOwner: false,
      }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    }), { status: 200 })));

    renderRoster();

    expect(await screen.findByRole("tab", { name: "Members" })).toBeVisible();
    const pendingTab = await screen.findByRole("tab", { name: "Pending Invitations (0)" });
    expect(screen.getByText("Member User")).toBeVisible();

    await userEvent.click(pendingTab);

    expect(screen.queryByText("Member User")).toBeNull();
    expect(screen.getByText("No pending invitations.")).toBeVisible();
  });

  it("only deletes a member after confirming in the custom modal", async () => {
    const member = {
      invitationId: "99999999-9999-4999-8999-999999999999",
      memberId: "33333333-3333-4333-8333-333333333333",
      userId: "44444444-4444-4444-8444-444444444444",
      email: "member@example.com",
      username: "Member User",
      imageUrl: null,
      organizationId,
      organizationName: "Takodu",
      establishmentId,
      establishmentName: "Main",
      status: "ACTIVE",
      roles: [],
      invitedAt: "2026-01-01T00:00:00Z",
      invitationExpiresAt: "2026-02-01T00:00:00Z",
      acceptedAt: "2026-01-01T00:00:00Z",
      joinedAt: "2026-01-01T00:00:00Z",
      removedAt: null,
      isOwner: false,
    };

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "DELETE") {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      void url;
      return Promise.resolve(new Response(JSON.stringify({
        content: [member],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    renderRoster();

    await userEvent.click(await screen.findByRole("button", { name: "Remove" }));

    const description = await screen.findByText(
      /Are you sure you want to remove Member User from this establishment\? This action cannot be undone\./,
    );
    const dialog = description.closest("[data-slot='alert-dialog-content']") as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(
      fetchMock.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === "DELETE"),
    ).toBe(false);

    await userEvent.click(within(dialog).getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/members/${member.memberId}`,
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
  });

  it("opens the invite dialog from the roster header", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(emptyRosterResponse()));

    renderRoster([...authorization.effectivePermissions, "workforce:invite"]);

    await userEvent.click(await screen.findByRole("button", { name: "Invite member" }));

    expect(screen.getByRole("heading", { name: "Invite member" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Email address" })).toBeVisible();
  });

  it("posts the invite form to the authenticated proxy route", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return Promise.resolve(new Response(JSON.stringify({
          id: "77777777-7777-4777-8777-777777777777",
          organizationId,
          establishmentId,
          establishmentName: "Main",
          invitedEmail: "new@example.com",
          invitedByUserId: "88888888-8888-4888-8888-888888888888",
          status: "PENDING",
          expiresAt: "2026-02-01T00:00:00Z",
          acceptedByUserId: null,
          acceptedAt: null,
          revokedAt: null,
          createdAt: "2026-01-01T00:00:00Z",
        }), { status: 201 }));
      }
      void url;
      return Promise.resolve(emptyRosterResponse());
    });
    vi.stubGlobal("fetch", fetchMock);

    renderRoster([...authorization.effectivePermissions, "workforce:invite"]);

    await userEvent.click(await screen.findByRole("button", { name: "Invite member" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Email address" }), "new@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send invitation" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workforce/invitations",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-Organization-Id": organizationId }),
        body: JSON.stringify({ establishmentId, email: "new@example.com" }),
      }),
    );
  });

  const managerRole = {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Manager",
    position: 1,
    systemRole: false,
    permissions: [],
  };
  const workerRole = {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Worker",
    position: 2,
    systemRole: false,
    permissions: [],
  };
  const activeMemberId = "33333333-3333-4333-8333-333333333333";

  function rosterWithMember(overrides: Record<string, unknown> = {}) {
    return {
      invitationId: "99999999-9999-4999-8999-999999999999",
      memberId: activeMemberId,
      userId: "44444444-4444-4444-8444-444444444444",
      email: "member@example.com",
      username: "Member User",
      imageUrl: null,
      organizationId,
      organizationName: "Takodu",
      establishmentId,
      establishmentName: "Main",
      status: "ACTIVE",
      roles: [managerRole],
      invitedAt: "2026-01-01T00:00:00Z",
      invitationExpiresAt: "2026-02-01T00:00:00Z",
      acceptedAt: "2026-01-01T00:00:00Z",
      joinedAt: "2026-01-01T00:00:00Z",
      removedAt: null,
      isOwner: false,
      ...overrides,
    };
  }

  function mockRolesFetch(member: Record<string, unknown>, roles: unknown[]) {
    return vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "DELETE") return Promise.resolve(new Response(null, { status: 204 }));
      if (init?.method === "PUT") return Promise.resolve(new Response(null, { status: 204 }));
      if (url === "/api/workforce/roles") {
        return Promise.resolve(new Response(JSON.stringify(roles), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({
        content: [member],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      }), { status: 200 }));
    });
  }

  it("removes an assigned role from a member via the badge control", async () => {
    const fetchMock = mockRolesFetch(rosterWithMember(), [managerRole, workerRole]);
    vi.stubGlobal("fetch", fetchMock);

    renderRoster();
    await userEvent.click(await screen.findByRole("button", { name: "Remove Manager role" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/roles/members/${activeMemberId}/${managerRole.id}`,
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
  });

  it("adds an unassigned role from the compact add menu", async () => {
    const fetchMock = mockRolesFetch(rosterWithMember(), [managerRole, workerRole]);
    vi.stubGlobal("fetch", fetchMock);

    renderRoster();
    await userEvent.click(await screen.findByRole("button", { name: "Add role" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Worker" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/roles/members/${activeMemberId}`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ roleId: workerRole.id }),
        }),
      ),
    );
  });

  it("keeps the Owner role tags static without remove or add controls", async () => {
    const ownerMember = rosterWithMember({
      username: "Organization Owner",
      isOwner: true,
      roles: [{
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        name: "Owner",
        position: 0,
        systemRole: true,
        permissions: ["*"],
      }],
    });
    vi.stubGlobal("fetch", mockRolesFetch(ownerMember, []));

    renderRoster();

    expect(await screen.findByText("Organization Owner")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Remove .* role/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add role" })).toBeNull();
  });
});
