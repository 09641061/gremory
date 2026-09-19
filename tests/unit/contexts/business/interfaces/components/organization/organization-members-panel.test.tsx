/** @vitest-environment jsdom */

import { render, screen, waitFor, within } from "@testing-library/react";
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
          userId: "44444444-4444-4444-8444-444444444445",
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

function mockBulkApi() {
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
          email: "alpha@example.com",
          username: "Alpha User",
          status: "ACTIVE",
          memberId: "44444444-4444-4444-8444-444444444444",
          roles: [memberRole],
        }),
        rosterEntry({
          email: "beta@example.com",
          username: "Beta User",
          status: "ACTIVE",
          memberId: "77777777-7777-4777-8777-777777777777",
          roles: [memberRole],
        }),
      ],
      page: 0,
      size: 100,
      totalElements: 3,
      totalPages: 1,
    }), { status: 200 }));
  });
}

function mockPendingBulkApi() {
  return vi.fn((url: string) => {
    if (url.startsWith("/api/workforce/roles/members")) {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (url.startsWith("/api/workforce/invitations/")) {
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
          email: "guest1@example.com",
          username: "Guest One",
          status: "PENDING",
          memberId: null,
          invitationId: "88888888-8888-4888-8888-888888888888",
          roles: [memberRole],
        }),
        rosterEntry({
          email: "guest2@example.com",
          username: "Guest Two",
          status: "PENDING",
          memberId: null,
          invitationId: "99999999-9999-4999-8999-999999999998",
          roles: [memberRole],
        }),
      ],
      page: 0,
      size: 100,
      totalElements: 3,
      totalPages: 1,
    }), { status: 200 }));
  });
}

const alphaId = "44444444-4444-4444-8444-444444444444";
const betaId = "77777777-7777-4777-8777-777777777777";

describe("OrganizationMembersPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders only active members with the toolbar and owner protection", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    expect(await screen.findByText("Active User")).toBeVisible();
    expect(screen.getAllByText("ACTIVE").length).toBeGreaterThan(0);
    // Pending invitations are isolated in the Invites view.
    expect(screen.queryByText("pending@example.com")).toBeNull();
    expect(screen.queryByText("PENDING")).toBeNull();
    // Exactly one mandatory system role badge per active row.
    expect(screen.getByText("Owner")).toBeVisible();
    expect(screen.getByText("Member")).toBeVisible();
    // Owner row is fully frozen: its ⋮ actions trigger is disabled.
    expect(screen.getByRole("button", { name: "Actions for Organization Owner" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Actions for Active User" })).toBeEnabled();
    expect(screen.getByPlaceholderText("Search members...")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Filter by Establishment" })).toBeVisible();
    // The invite action now lives in the Invites view.
    expect(screen.queryByRole("button", { name: /Invite member/ })).toBeNull();
  });

  it("isolates the Invites view to pending invitations only", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

    expect((await screen.findAllByText("pending@example.com")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Active User")).toBeNull();
    expect(screen.getByPlaceholderText("Search invitations...")).toBeVisible();
    expect(screen.getByRole("button", { name: /Invite member/ })).toBeVisible();
  });

  it("generates a shareable multi-use invitation link from the Invites toolbar", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/workforce/invitations/shareable-links")) {
        if (init?.method === "POST") {
          return Promise.resolve(new Response(JSON.stringify({
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            url: "http://localhost:3000/invitations/join?token=devtoken",
            expiresAt: "2026-02-01T00:00:00Z",
          }), { status: 201 }));
        }
        // The persisted link is returned by the list endpoint after creation.
        return Promise.resolve(new Response(JSON.stringify([{
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          url: "http://localhost:3000/invitations/join?token=devtoken",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          establishmentIds: [establishmentId],
          roleIds: [memberRole.id],
        }]), { status: 200 }));
      }
      if (url.startsWith("/api/workforce/roles")) {
        return Promise.resolve(new Response(JSON.stringify([ownerRole, memberRole, cashierRole]), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({
        content: [
          rosterEntry({
            email: "guest@example.com",
            username: "Guest One",
            status: "PENDING",
            memberId: null,
            invitationId: "88888888-8888-4888-8888-888888888888",
            roles: [memberRole],
          }),
        ],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
      }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

    await screen.findByText("Guest One");
    await userEvent.click(screen.getByRole("button", { name: /Generate Invite Link/ }));

    expect(await screen.findByRole("heading", { name: /Generate Invite Link/ })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Base System Role" })).toBeVisible();
    expect(screen.getByText("Custom Roles")).toBeVisible();
    expect(screen.getByText("Establishment Access")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Link Expiration" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Generate Link" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/workforce/invitations/shareable-links",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            establishmentIds: [establishmentId],
            roleIds: [memberRole.id],
            expiration: "ONE_DAY",
          }),
        }),
      );
    });

    const linkInput = await screen.findByRole("textbox", { name: "Shareable invitation link" });
    expect(linkInput).toHaveValue("http://localhost:3000/invitations/join?token=devtoken");
    expect(screen.getByRole("button", { name: /Copy Link/ })).toBeVisible();

    // The parent reloaded and hydrated the Invite Links table with the new row.
    await waitFor(() => expect(screen.getByPlaceholderText("Search shareable links...")).toBeVisible());
    expect(await screen.findByText("🔗 Shareable Link")).toBeVisible();
  });

  it("lists shareable invite links as rows with expiration badges and link actions", async () => {
    const linkId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const expiresAt = new Date(Date.now() + 3 * 86400000).toISOString();
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/workforce/invitations/shareable-links")) {
        // url: null mirrors legacy rows created before the join_url column existed and
        // must not discard the whole array.
        return Promise.resolve(new Response(JSON.stringify([{
          id: linkId,
          url: null,
          expiresAt,
          establishmentIds: [establishmentId],
          roleIds: [memberRole.id],
        }]), { status: 200 }));
      }
      if (url.startsWith("/api/workforce/roles")) {
        return Promise.resolve(new Response(JSON.stringify([ownerRole, memberRole, cashierRole]), { status: 200 }));
      }
      void init;
      return Promise.resolve(new Response(JSON.stringify({
        content: [
          rosterEntry({
            email: "guest@example.com",
            username: "Guest One",
            status: "PENDING",
            memberId: null,
            invitationId: "88888888-8888-4888-8888-888888888888",
            roles: [memberRole],
          }),
        ],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
      }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

    // Personal Invites is the default sub-view.
    expect(await screen.findByText("Guest One")).toBeVisible();
    expect(screen.getByPlaceholderText("Search invitations...")).toBeVisible();

    await userEvent.click(screen.getByRole("tab", { name: "Invite Links" }));
    expect(screen.getByPlaceholderText("Search shareable links...")).toBeVisible();
    // Personal invitations are not part of the links sub-view.
    expect(screen.queryByText("Guest One")).toBeNull();

    expect(await screen.findByText("🔗 Shareable Link")).toBeVisible();
    expect(screen.getByText("Role: Member")).toBeVisible();
    expect(screen.getByText("Multi-use token")).toBeVisible();
    expect(screen.getByText("EXP_3_DAYS")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Actions for Shareable Link" }));
    expect(await screen.findByRole("menuitem", { name: "Copy Link URL" })).toBeVisible();
    await userEvent.click(screen.getByRole("menuitem", { name: "Revoke Link" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/invitations/shareable-links/${linkId}`,
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    await userEvent.click(screen.getByRole("tab", { name: "Personal Invites" }));
    expect(screen.getByPlaceholderText("Search invitations...")).toBeVisible();
    expect(screen.getByText("Guest One")).toBeVisible();
  });

  it("filters the roster locally by search", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Active User");
    await userEvent.type(screen.getByPlaceholderText("Search members..."), "active@example.com");

    expect(screen.getByText("Active User")).toBeVisible();
    expect(screen.queryByText("Organization Owner")).toBeNull();
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

  it("filters members cumulatively by assigned role with clean options", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Active User");
    // External prefix label, matching the Establishment filter styling.
    expect(screen.getByText("Role:")).toBeVisible();

    const roleFilter = screen.getByRole("combobox", { name: "Filter by Role" });
    await userEvent.click(roleFilter);

    expect(await screen.findByRole("option", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Member" })).toBeInTheDocument();
    const cashierOption = screen.getByRole("option", { name: "Cashier" });
    expect(cashierOption.textContent).not.toContain("[");

    await userEvent.click(cashierOption);

    expect(screen.getByText("Active User")).toBeVisible();
    expect(screen.queryByText("Organization Owner")).toBeNull();
  });

  it("resends a pending invitation through the dedicated endpoint", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

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

  it("evicts a member from the whole organization on confirm", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Active User");
    const row = screen.getByText("Active User").closest("tr");
    expect(row).not.toBeNull();

    await userEvent.click(within(row!).getByRole("button", { name: "Actions for Active User" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Remove from Organization" }));
    await userEvent.click(await screen.findByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/organizations/${organizationId}/members/44444444-4444-4444-8444-444444444445`,
        expect.objectContaining({ method: "DELETE" }),
      );
    });
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

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

    await screen.findAllByText("pending@example.com");
    await userEvent.click(screen.getByRole("button", { name: /Invite member/ }));

    expect(screen.getByRole("heading", { name: "Invite member" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Role" })).toBeVisible();
    expect(screen.getByText("All establishments")).toBeVisible();
    expect(screen.getByRole("button", { name: "Send invitation" })).toBeVisible();
  });

  it("excludes the Owner from bulk selection and reveals the bar only from two picks", async () => {
    vi.stubGlobal("fetch", mockBulkApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Alpha User");
    expect(screen.getByRole("checkbox", { name: "Select Organization Owner" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Select all members" })).toBeEnabled();

    await userEvent.click(screen.getByRole("checkbox", { name: "Select Alpha User" }));
    expect(screen.queryByText(/members selected/)).toBeNull();
  });

  it("toggles every selectable row from the header checkbox", async () => {
    vi.stubGlobal("fetch", mockBulkApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Alpha User");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all members" }));

    expect(await screen.findByText("2 members selected")).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Select Organization Owner" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Select Alpha User" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select Beta User" })).toBeChecked();
  });

  it("batch-changes the base role for every selected member", async () => {
    const fetchMock = mockBulkApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Alpha User");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Alpha User" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Beta User" }));

    expect(await screen.findByText("2 members selected")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /Change Base Role/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Admin" }));

    await waitFor(() => {
      for (const memberId of [alphaId, betaId]) {
        expect(fetchMock).toHaveBeenCalledWith(
          `/api/workforce/roles/members/${memberId}/${memberRole.id}`,
          expect.objectContaining({ method: "DELETE" }),
        );
        expect(fetchMock).toHaveBeenCalledWith(
          `/api/workforce/roles/members/${memberId}`,
          expect.objectContaining({ method: "PUT", body: JSON.stringify({ roleId: adminRole.id }) }),
        );
      }
    });
    // A single clean reload clears the selection and hides the bar.
    await waitFor(() => expect(screen.queryByText(/members selected/)).toBeNull());
  });

  it("batch-appends a custom role to every selected member", async () => {
    const fetchMock = mockBulkApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Alpha User");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Alpha User" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Beta User" }));
    await userEvent.click(screen.getByRole("button", { name: /Add Custom Role/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Cashier" }));

    await waitFor(() => {
      for (const memberId of [alphaId, betaId]) {
        expect(fetchMock).toHaveBeenCalledWith(
          `/api/workforce/roles/members/${memberId}`,
          expect.objectContaining({ method: "PUT", body: JSON.stringify({ roleId: cashierRole.id }) }),
        );
      }
    });
  });

  it("selects pending invitations and batch-remaps their acceptance roles", async () => {
    const fetchMock = mockPendingBulkApi();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

    await screen.findByText("Guest One");
    // Pending invitations are selectable; only the Owner is frozen.
    expect(screen.getByRole("checkbox", { name: "Select Guest One" })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: "Select Guest Two" })).toBeEnabled();

    await userEvent.click(screen.getByRole("checkbox", { name: "Select Guest One" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Guest Two" }));
    expect(await screen.findByText("2 members selected")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: /Change Base Role/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Admin" }));

    await waitFor(() => {
      for (const invitationId of [
        "88888888-8888-4888-8888-888888888888",
        "99999999-9999-4999-8999-999999999998",
      ]) {
        expect(fetchMock).toHaveBeenCalledWith(
          `/api/workforce/invitations/${invitationId}/roles`,
          expect.objectContaining({ method: "PUT", body: JSON.stringify({ roleIds: [adminRole.id] }) }),
        );
      }
    });
  });

  it("revokes a pending invitation from the row actions menu", async () => {
    const fetchMock = mockPendingBulkApi();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

    await screen.findByText("Guest One");
    const row = screen.getByText("Guest One").closest("tr");
    expect(row).not.toBeNull();

    await userEvent.click(within(row!).getByRole("button", { name: "Actions for Guest One" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Revoke Invitation" }));
    // Confirmation modal fires the DELETE proxy.
    await userEvent.click(await screen.findByRole("button", { name: "Revoke Invitation" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/workforce/invitations/88888888-8888-4888-8888-888888888888",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("revokes every selected pending invitation from the bulk bar", async () => {
    const fetchMock = mockPendingBulkApi();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OrganizationMembersPanel
        organizationId={organizationId}
        establishments={establishments}
        mode="invites"
      />,
    );

    await screen.findByText("Guest One");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Guest One" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Guest Two" }));
    expect(await screen.findByText("2 members selected")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Revoke Selected" }));

    await waitFor(() => {
      for (const invitationId of [
        "88888888-8888-4888-8888-888888888888",
        "99999999-9999-4999-8999-999999999998",
      ]) {
        expect(fetchMock).toHaveBeenCalledWith(
          `/api/workforce/invitations/${invitationId}`,
          expect.objectContaining({ method: "DELETE" }),
        );
      }
    });
    await waitFor(() => expect(screen.queryByText(/members selected/)).toBeNull());
  });

  it("clears the selection from the bulk bar cancel action", async () => {
    vi.stubGlobal("fetch", mockBulkApi());

    render(<OrganizationMembersPanel organizationId={organizationId} establishments={establishments} />);

    await screen.findByText("Alpha User");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Alpha User" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Beta User" }));
    expect(await screen.findByText("2 members selected")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText(/members selected/)).toBeNull();
  });
});
