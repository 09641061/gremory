/** @vitest-environment jsdom */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganizationMembersPanel } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-members-panel";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "55555555-5555-4555-8555-555555555555";

const establishments = [{ id: establishmentId, name: "LOCALOne" }];

const memberRole = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Member", position: 2, systemRole: true, permissions: [] };

function rosterEntry(overrides: Record<string, unknown>) {
  return {
    invitationId: "99999999-9999-4999-8999-999999999999",
    memberId: null,
    userId: null,
    email: "member@example.com",
    username: null,
    imageUrl: null,
    organizationId,
    organizationName: "Takodu",
    establishmentId,
    establishmentName: "LOCALOne",
    status: "PENDING",
    roles: [],
    invitedAt: "2026-01-01T00:00:00Z",
    invitationExpiresAt: "2026-02-01T00:00:00Z",
    acceptedAt: null,
    joinedAt: null,
    removedAt: null,
    isOwner: false,
    ...overrides,
  };
}

function mockApi() {
  return vi.fn((url: string) => {
    if (url.startsWith("/api/workforce/roles")) {
      return Promise.resolve(new Response(JSON.stringify([memberRole]), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({
      content: [
        rosterEntry({
          username: "Organization Owner",
          isOwner: true,
          status: "ACTIVE",
          memberId: "33333333-3333-4333-8333-333333333333",
        }),
        rosterEntry({ email: "active@example.com", username: "Active User", status: "ACTIVE", memberId: "44444444-4444-4444-8444-444444444444" }),
        rosterEntry({ email: "pending@example.com", status: "PENDING" }),
      ],
      page: 0,
      size: 100,
      totalElements: 3,
      totalPages: 1,
    }), { status: 200 }));
  });
}

describe("OrganizationMembersPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the unified roster with toolbar and owner protection", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    expect(await screen.findByText("Active User")).toBeVisible();
    expect(screen.getAllByText("pending@example.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ACTIVE").length).toBeGreaterThan(0);
    expect(screen.getByText("PENDING")).toBeVisible();
    expect(screen.getByText("Protected")).toBeVisible();
    expect(screen.getByPlaceholderText("Search members...")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Filter by Establishment" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Invite member/ })).toBeVisible();
  });

  it("filters the roster locally by search", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Active User");
    await userEvent.type(screen.getByPlaceholderText("Search members..."), "pending");

    expect(screen.getAllByText("pending@example.com").length).toBeGreaterThan(0);
    expect(screen.queryByText("Active User")).toBeNull();
  });

  it("resends a pending invitation through the dedicated endpoint", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    const row = (await screen.findAllByText("pending@example.com"))[0].closest("tr");
    expect(row).not.toBeNull();
    await userEvent.hover(row!);
    await userEvent.click(within(row!).getByRole("button", { name: "Resend" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workforce/invitations/99999999-9999-4999-8999-999999999999/resend",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("persists the establishment scope through the scope endpoint", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);
    const second = { id: "66666666-6666-4666-8666-666666666666", name: "Second Site" };

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={[establishments[0], second]}
      />,
    );

    await screen.findByText("Active User");
    await userEvent.click(screen.getAllByRole("button", { name: "LOCALOne" })[0]);
    await userEvent.click(screen.getByRole("checkbox", { name: "Second Site" }));
    await userEvent.click(screen.getByRole("button", { name: "Save Scope" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workforce/members/44444444-4444-4444-8444-444444444444/scope",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          establishmentIds: [establishmentId, "66666666-6666-4666-8666-666666666666"],
        }),
      }),
    );
  });

  it("opens the single-step invite dialog with the three fields", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Active User");
    await userEvent.click(screen.getByRole("button", { name: /Invite member/ }));

    expect(screen.getByRole("heading", { name: "Invite member" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Role" })).toBeVisible();
    expect(screen.getByText("All establishments")).toBeVisible();
    expect(screen.getByRole("button", { name: "Send invitation" })).toBeVisible();
  });
});
