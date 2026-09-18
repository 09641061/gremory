/** @vitest-environment jsdom */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganizationMembersPanel } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-members-panel";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "55555555-5555-4555-8555-555555555555";

const establishments = [{ id: establishmentId, name: "LOCALOne" }];

const ownerRole = { id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", name: "Owner", position: 0, systemRole: true, permissions: ["*"] };
const adminRole = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", name: "Admin", position: 1, systemRole: true, permissions: [] };
const memberRole = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Member", position: 2, systemRole: true, permissions: [] };
const cashierRole = { id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", name: "Cashier", position: 3, systemRole: false, permissions: [] };

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
    if (url.startsWith("/api/workforce/roles/members")) {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (url.startsWith("/api/workforce/roles")) {
      return Promise.resolve(new Response(JSON.stringify([ownerRole, adminRole, memberRole, cashierRole]), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({
      content: [
        rosterEntry({
          username: "Organization Owner",
          isOwner: true,
          status: "ACTIVE",
          memberId: "33333333-3333-4333-8333-333333333333",
          roles: [ownerRole],
        }),
        rosterEntry({
          email: "active@example.com",
          username: "Active User",
          status: "ACTIVE",
          memberId: "44444444-4444-4444-8444-444444444444",
          roles: [memberRole, cashierRole],
        }),
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
    // Exactly one mandatory system role badge per active row.
    expect(screen.getByText("Owner")).toBeVisible();
    expect(screen.getByText("Member")).toBeVisible();
    // Owner row is fully frozen: its ⋮ actions trigger is disabled.
    expect(screen.getByRole("button", { name: "Actions for Organization Owner" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Actions for Active User" })).toBeEnabled();
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

  it("filters by establishment through the styled dropdown with clean options", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    expect(await screen.findByText("Establishment:")).toBeVisible();
    const filter = screen.getByRole("combobox", { name: "Filter by Establishment" });
    await userEvent.click(filter);

    const allOption = await screen.findByRole("option", { name: "All" });
    const localOption = screen.getByRole("option", { name: "LOCALOne" });
    expect(allOption).toBeInTheDocument();
    expect(localOption).toBeInTheDocument();
    expect(allOption).not.toHaveTextContent("Filter by Establishment");
    expect(localOption).not.toHaveTextContent("Filter by Establishment");

    await userEvent.click(localOption);
    expect(filter).toHaveTextContent("LOCALOne");
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
    const activeRow = screen.getByText("Active User").closest("tr");
    expect(activeRow).not.toBeNull();
    await userEvent.click(within(activeRow!).getByRole("button", { name: "Actions for Active User" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit Establishment Scope" }));
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

  it("swaps the system role from the inline role popover", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Active User");
    await userEvent.click(screen.getByRole("button", { name: "Add role" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Admin" }));

    const memberId = "44444444-4444-4444-8444-444444444444";
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/workforce/roles/members/${memberId}/${memberRole.id}`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/workforce/roles/members/${memberId}`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ roleId: adminRole.id }),
      }),
    );
  });

  it("keeps system roles solid and only removes custom roles inline", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Active User");
    const memberId = "44444444-4444-4444-8444-444444444444";

    // System roles (Owner/Admin/Member) never expose an inline removal.
    expect(screen.queryByRole("button", { name: "Remove Member role" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove Owner role" })).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Remove Cashier role" }));

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/workforce/roles/members/${memberId}/${cashierRole.id}`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(screen.queryByRole("button", { name: "Remove Cashier role" })).toBeNull();
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
