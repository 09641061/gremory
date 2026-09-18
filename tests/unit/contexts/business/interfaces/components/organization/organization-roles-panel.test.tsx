/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
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
// Admin and Manager are no longer factory system roles; they are regular custom roles.
const adminRole = {
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  name: "Admin",
  position: 1,
  systemRole: false,
  permissions: [],
};
const managerRole = {
  id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  name: "Manager",
  position: 2,
  systemRole: false,
  permissions: [],
};
const memberSystemRole = {
  id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  name: "Member",
  position: 3,
  systemRole: true,
  permissions: [],
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
      return Promise.resolve(new Response(JSON.stringify([
        ownerRole,
        adminRole,
        memberSystemRole,
        managerRole,
        customRole,
      ]), { status: 200 }));
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

  it("groups system and custom roles in the sub-sidebar with clean, counter-free names", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
    expect(screen.getByText("System Roles")).toBeVisible();
    expect(screen.getByText("Custom Roles")).toBeVisible();

    // The old top dropdown selector is gone.
    expect(screen.queryByRole("combobox", { name: "Select role" })).toBeNull();

    // The immutable Owner role is excluded from the editor entirely.
    expect(screen.queryByRole("button", { name: "Owner" })).toBeNull();
    const memberButton = screen.getByRole("button", { name: "Member" });
    const cashierButton = screen.getByRole("button", { name: "Cashier" });
    expect(memberButton).not.toHaveTextContent(/\(\d+\)/);
    expect(cashierButton).not.toHaveTextContent(/\(\d+\)/);
    expect(screen.queryByText("Built-in")).toBeNull();
    expect(screen.queryByText("[System]")).toBeNull();
    expect(screen.queryByText("[Custom]")).toBeNull();
  });

  it("orders system roles by descending authority and maps the approved icons", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");

    // SYSTEM ROLES renders only the editable Member role; Owner is hidden.
    expect(screen.queryByRole("button", { name: "Owner" })).toBeNull();
    expect(screen.getByRole("button", { name: "Member" }).querySelector(".lucide-user")).not.toBeNull();
    // Demoted roles and user-created roles share the custom "Cog" icon.
    expect(screen.getByRole("button", { name: "Admin" }).querySelector(".lucide-cog")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Manager" }).querySelector(".lucide-cog")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Cashier" }).querySelector(".lucide-cog")).not.toBeNull();
  });

  it("keeps the Member baseline editable while locking only its factory name and deletion", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");

    // Factory name is immutable and the role can never be deleted...
    expect(screen.getByRole("textbox", { name: "Role Name" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Delete Role/ })).toBeNull();
    // ...but the permission matrix is editable and no blocking label is shown.
    expect(screen.getByRole("combobox", { name: "Badge Color" })).toBeEnabled();
    expect(screen.queryByText("System roles cannot be modified")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /Catalog/ }));
    const save = screen.getByRole("button", { name: "Save Changes" });
    expect(save).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox", { name: /Manage catalog/ }));
    expect(save).toBeEnabled();
  });

  it("saves Member permissions without sending a rename", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
    await userEvent.click(screen.getByRole("button", { name: /Catalog/ }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Manage catalog/ }));
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/workforce/roles/${memberSystemRole.id}`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ permissions: ["catalog:manage"] }),
        }),
      );
    });
  });

  it("makes a custom role fully editable and offers Delete Role", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await userEvent.click(await screen.findByRole("button", { name: "Cashier" }));

    expect(screen.getByRole("textbox", { name: "Role Name" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Role Name" })).toHaveValue("Cashier");
    expect(screen.getByRole("button", { name: /Delete Role/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  });

  it("renders exactly the two streamlined Catalog permission rows", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
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

  it("renders exactly the three balanced CRM permission rows", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
    await userEvent.click(screen.getByRole("button", { name: /CRM & Customers/ }));

    expect(screen.getByText("Manage customer directory")).toBeVisible();
    expect(screen.getByText("crm:customer:manage")).toBeVisible();
    expect(
      screen.getByText(
        "- Full management packet: Search customers, view history/profile, create new records, and edit contact data.",
      ),
    ).toBeVisible();

    expect(screen.getByText("Delete customers")).toBeVisible();
    expect(screen.getByText("crm:customer:delete")).toBeVisible();
    expect(
      screen.getByText(
        "- Destructive action: Permanently delete customer profiles from the system database.",
      ),
    ).toBeVisible();

    expect(screen.getByText("Autofill identity data")).toBeVisible();
    expect(screen.getByText("crm:customer:resolve-document")).toBeVisible();
    expect(
      screen.getByText(
        "- API Consumption: Enable the automatic data backfill button using DNI/RUC queries.",
      ),
    ).toBeVisible();

    expect(screen.getByRole("checkbox", { name: /Manage customer directory/ })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /Delete customers/ })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /Autofill identity data/ })).toBeVisible();
    expect(screen.queryByText("View customers")).toBeNull();
    expect(screen.queryByText("Write customer records")).toBeNull();
  });

  it("renders exactly the three robust Schedule permission rows", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
    await userEvent.click(screen.getByRole("button", { name: /Appointments \/ Schedule/ }));

    expect(screen.getByText("Manage schedule & appointments")).toBeVisible();
    expect(screen.getByText("scheduling:appointment:manage")).toBeVisible();
    expect(
      screen.getByText(
        "- Full operational packet: View calendar grid, book appointments, reschedule/edit fields, and trigger status updates (Start, Complete, No-show).",
      ),
    ).toBeVisible();

    expect(screen.getByText("Cancel appointments")).toBeVisible();
    expect(screen.getByText("scheduling:appointment:cancel")).toBeVisible();
    expect(
      screen.getByText(
        "- Operational annulment: Cancel appointments while registering a required reason, keeping the data history intact for metrics.",
      ),
    ).toBeVisible();

    expect(screen.getByText("Delete appointments")).toBeVisible();
    expect(screen.getByText("scheduling:appointment:delete")).toBeVisible();
    expect(
      screen.getByText(
        "- Destructive action: Permanently delete appointment records from the system database.",
      ),
    ).toBeVisible();

    expect(screen.getByRole("checkbox", { name: /Manage schedule & appointments/ })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /Cancel appointments/ })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /Delete appointments/ })).toBeVisible();
    expect(screen.queryByText("View calendar")).toBeNull();
  });

  it("renders exactly the two streamlined Assistant permission rows", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
    await userEvent.click(screen.getByRole("button", { name: /Assistant/ }));

    expect(screen.getByText("Use AI assistant")).toBeVisible();
    expect(screen.getByText("assistant:use")).toBeVisible();
    expect(
      screen.getByText(
        "- Full interaction packet: Open AI interface, send prompts, create conversations, view sidebar history, and rename chats.",
      ),
    ).toBeVisible();

    expect(screen.getByText("Delete conversations")).toBeVisible();
    expect(screen.getByText("assistant:delete")).toBeVisible();
    expect(
      screen.getByText(
        "- Destructive action: Permanently delete chat threads or conversation history from the database.",
      ),
    ).toBeVisible();

    expect(screen.getByRole("checkbox", { name: /Use AI assistant/ })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /Delete conversations/ })).toBeVisible();
    expect(screen.queryByText("Interact with AI Assistant")).toBeNull();
    expect(screen.queryByText("Manage AI conversations")).toBeNull();
  });

  it("lists core modules first and keeps governance as four selectable accordions", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
    await userEvent.click(screen.getByRole("button", { name: /Create custom role/ }));

    // Core modules are rendered first under their own section header.
    expect(screen.getByText("Suite Core Modules")).toBeVisible();
    expect(screen.getByRole("button", { name: /^Catalog/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Assistant/ })).toBeVisible();

    // Governance follows, split into four independent accordions.
    expect(screen.getByText("Organization & Governance")).toBeVisible();
    expect(screen.getByRole("button", { name: /^Organization Settings/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Establishments Management/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Team & Workforce/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Governance & Roles/ })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: /^Organization Settings/ }));
    expect(screen.getByText("View organization details")).toBeVisible();

    // Its own Select All selects the two keys of that accordion.
    await userEvent.click(screen.getAllByRole("button", { name: "Select All" })[4]);
    expect(screen.getByRole("checkbox", { name: /View organization details/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Update organization info/ })).toBeChecked();
  });

  it("clears the form when creating a custom role", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<OrganizationRolesPanel organizationId={organizationId} />);

    await screen.findByDisplayValue("Member");
    await userEvent.click(screen.getByRole("button", { name: /Create custom role/ }));

    expect(screen.getByRole("textbox", { name: "Role Name" })).toHaveValue("");
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Delete Role/ })).toBeNull();
  });
});
