/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganizationMembersPanel } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-members-panel";
import { OrganizationRolesPanel } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-roles-panel";
import { WorkforceRoleColorProvider } from "@/contexts/workforce/interfaces/components/workforce-role-color-context";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "55555555-5555-4555-8555-555555555555";

const memberRole = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "Member",
  position: 2,
  systemRole: true,
  permissions: [],
  color: "#8B5CF6",
};

const rosterEntry = {
  invitationId: "99999999-9999-4999-8999-999999999999",
  memberId: "33333333-3333-4333-8333-333333333333",
  userId: "44444444-4444-4444-8444-444444444444",
  email: "active@example.com",
  username: "Active User",
  imageUrl: null,
  organizationId,
  organizationName: "Takodu",
  establishmentId,
  establishmentName: "LOCALOne",
  status: "ACTIVE",
  roles: [memberRole],
  invitedAt: "2026-01-01T00:00:00Z",
  invitationExpiresAt: "2026-02-01T00:00:00Z",
  acceptedAt: "2026-01-01T00:00:00Z",
  joinedAt: "2026-01-01T00:00:00Z",
  removedAt: null,
  isOwner: false,
};

function mockApi() {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const payload = init?.body ? JSON.parse(String(init.body)) : null;
    // The role save echoes the persisted role back so the editor can reconcile locally.
    if (url === `/api/workforce/roles/${memberRole.id}` && init?.method === "PATCH") {
      return new Response(JSON.stringify({ ...memberRole, ...payload }), { status: 200 });
    }
    if (url.startsWith("/api/workforce/roles")) {
      return new Response(JSON.stringify([memberRole]), { status: 200 });
    }
    return new Response(
      JSON.stringify({
        content: [rosterEntry],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
      }),
      { status: 200 },
    );
  });
}

function findRoleBadge(name: string): HTMLElement | null {
  return (
    screen
      .getAllByText(name)
      .map((node) => node.closest("[data-slot='badge']"))
      .find((element): element is HTMLElement => element !== null) ?? null
  );
}

describe("organization role color synchronization", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("repaints member role badges after the roles editor saves a new color", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <WorkforceRoleColorProvider>
        <OrganizationMembersPanel
          organizationId={organizationId}
          establishments={[{ id: establishmentId, name: "LOCALOne" }]}
        />
        <OrganizationRolesPanel organizationId={organizationId} />
      </WorkforceRoleColorProvider>,
    );

    await screen.findByText("Active User");
    await screen.findByDisplayValue("Member");

    const badgeBefore = findRoleBadge("Member");
    expect(badgeBefore).not.toBeNull();
    expect(badgeBefore!.style.color).toBe("rgb(139, 92, 246)");

    await userEvent.click(screen.getByRole("radio", { name: "Color #10B981" }));
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/roles/${memberRole.id}`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    await waitFor(() => {
      const badgeAfter = findRoleBadge("Member");
      expect(badgeAfter).not.toBeNull();
      expect(badgeAfter!.style.color).toBe("rgb(16, 185, 129)");
    });

    // The badge repaints through shared state, without ever refetching the roster.
    const memberRequests = fetchMock.mock.calls.filter(([url]) =>
      String(url).startsWith("/api/workforce/members"),
    );
    expect(memberRequests).toHaveLength(1);
  });
});
