/** @vitest-environment jsdom */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganizationRolesPanel } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-roles-panel";

const organizationId = "11111111-1111-4111-8111-111111111111";
const ownerRoleId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const customRoleId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const ownerRole = {
  id: ownerRoleId,
  name: "Owner",
  position: 0,
  systemRole: true,
  permissions: ["*"],
};
const customRole = {
  id: customRoleId,
  name: "Cashier",
  position: 1,
  systemRole: false,
  permissions: ["catalog:manage"],
};

const member = {
  invitationId: "99999999-9999-4999-8999-999999999999",
  memberId: "33333333-3333-4333-8333-333333333333",
  userId: "44444444-4444-4444-8444-444444444444",
  email: "member@example.com",
  username: "Member User",
  imageUrl: null,
  organizationId,
  organizationName: "Takodu",
  establishmentId: "55555555-5555-4555-8555-555555555555",
  establishmentName: "Main",
  status: "ACTIVE",
  roles: [{ id: ownerRoleId, name: "Owner", position: 0, systemRole: true, permissions: ["*"] }],
  invitedAt: "2026-01-01T00:00:00Z",
  invitationExpiresAt: "2026-02-01T00:00:00Z",
  acceptedAt: "2026-01-01T00:00:00Z",
  joinedAt: "2026-01-01T00:00:00Z",
  removedAt: null,
  isOwner: true,
};

function mockApi() {
  return vi.fn((url: string) => {
    if (url.startsWith("/api/workforce/roles")) {
      return Promise.resolve(new Response(JSON.stringify([ownerRole, customRole]), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({
      content: [member],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    }), { status: 200 }));
  });
}

describe("OrganizationRolesPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists roles in the selector with counters and system/custom tags", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    const select = await screen.findByRole("combobox", { name: "Select role" });
    expect(await within(select).findByRole("option", { name: /Owner \(1\) \[System\]/ })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: /Cashier \(0\) \[Custom\]/ })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: /New Role/ })).toBeInTheDocument();
  });

  it("freezes every control for a system role", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    const select = await screen.findByRole("combobox", { name: "Select role" });
    await within(select).findByRole("option", { name: /Owner/ });

    expect(screen.getByRole("textbox", { name: "Role Name" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Badge Color" })).toBeDisabled();
    expect(screen.getByText("System roles cannot be modified")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Delete Role/ })).toBeNull();
  });

  it("makes a custom role fully editable and offers Delete Role", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    const select = await screen.findByRole("combobox", { name: "Select role" });
    await within(select).findByRole("option", { name: /Cashier/ });
    await userEvent.selectOptions(select, customRoleId);

    expect(screen.getByRole("textbox", { name: "Role Name" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Role Name" })).toHaveValue("Cashier");
    expect(screen.getByRole("button", { name: /Delete Role/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  });

  it("renders exactly the two streamlined Catalog permission rows", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    const select = await screen.findByRole("combobox", { name: "Select role" });
    await within(select).findByRole("option", { name: /Cashier/ });
    await userEvent.click(screen.getByRole("button", { name: /Catalog/ }));

    expect(screen.getByText("Manage catalog")).toBeVisible();
    expect(screen.getByText("catalog:manage")).toBeVisible();
    expect(
      screen.getByText(
        "- Full management packet: View catalog, create and edit services, activate/deactivate, move categories, and create/edit categories.",
      ),
    ).toBeVisible();

    expect(screen.getByText("Delete catalog entries")).toBeVisible();
    expect(screen.getByText("catalog:delete")).toBeVisible();
    expect(
      screen.getByText(
        "- Destructive action: Permanently delete services or categories from the system.",
      ),
    ).toBeVisible();

    expect(screen.getByRole("checkbox", { name: /Manage catalog/ })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /Delete catalog entries/ })).toBeVisible();
    expect(screen.queryByText("View catalog")).toBeNull();
    expect(screen.queryByText("Write catalog entries")).toBeNull();
  });

  it("clears the form when creating a custom role", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    const select = await screen.findByRole("combobox", { name: "Select role" });
    await within(select).findByRole("option", { name: /Owner/ });
    await userEvent.click(screen.getByRole("button", { name: /Create custom role/ }));

    expect(screen.getByRole("textbox", { name: "Role Name" })).toHaveValue("");
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Delete Role/ })).toBeNull();
  });
});
