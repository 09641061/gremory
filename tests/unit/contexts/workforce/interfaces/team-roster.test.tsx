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

    const title = await screen.findByText("Pending Invitations");
    const section = title.closest("[data-slot='card']") as HTMLElement;
    expect(await within(section).findByText("pending@example.com")).toBeVisible();
    expect(within(section).getByText(/Sent/)).toBeVisible();
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
});
