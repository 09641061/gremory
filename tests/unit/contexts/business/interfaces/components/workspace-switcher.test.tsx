/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { OrganizationBadge } from "@/contexts/business/interfaces/components/workspace/organization-badge/organization-badge";
import { WorkspaceSwitcher } from "@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/schedule",
  useSearchParams: () => new URLSearchParams(),
}));

const organization = {
  id: "org-1",
  name: "Acme",
  imageUrl: "https://cdn.test/acme.png",
  canRead: true,
  canUpdate: true,
};

const baseWorkspace: WorkspaceHeaderViewModel = {
  accountType: "OWNER",
  onboardingStatus: "COMPLETED",
  onboardingCompleted: true,
  ownedOrganizationId: organization.id,
  organization,
  establishments: [
    { id: "est-1", name: "Main branch", photoUrl: "https://cdn.test/main.png" },
  ],
  activeEstablishmentId: "est-1",
  canReadOrganization: true,
  canReadEstablishments: true,
  canCreateEstablishment: true,
};

function renderSwitcher(workspace: Partial<WorkspaceHeaderViewModel> = {}) {
  render(<WorkspaceSwitcher workspace={{ ...baseWorkspace, ...workspace }} />);
}

function openMenu() {
  fireEvent.click(screen.getByRole("combobox", { name: /Main branch/ }));
}

describe("OrganizationBadge", () => {
  it("links the organization to its settings instead of offering a switcher", () => {
    render(<OrganizationBadge organization={organization} href="/organization" />);

    // The organization is fixed for the account: there is nothing to switch to,
    // but clicking it opens the screen where its name and logo are edited.
    expect(screen.getByRole("link", { name: /Acme/ }).getAttribute("href")).toBe("/organization");
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("renders the organization as plain text when the account cannot read it", () => {
    render(<OrganizationBadge organization={organization} />);

    expect(screen.getByText("Acme")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("WorkspaceSwitcher", () => {
  it("names both the organization and the establishment on a single trigger", () => {
    renderSwitcher();

    const trigger = screen.getByRole("combobox", { name: /Main branch/ });
    expect(trigger.textContent).toContain("Acme");
    expect(trigger.textContent).toContain("Main branch");
  });

  it("scopes the menu with the organization it lists establishments for", () => {
    renderSwitcher();
    openMenu();

    expect(
      screen.getByRole("link", { name: /Acme/ }).getAttribute("href"),
    ).toBe("/organization?establishmentId=est-1");
  });

  it("keeps the organization out of the menu when the account cannot read it", () => {
    renderSwitcher({ organization: { ...organization, canRead: false, canUpdate: false } });
    openMenu();

    expect(screen.queryByRole("link", { name: /Acme/ })).toBeNull();
  });

  it("shows the organization as plain text, never an editable link, when the account can only read it", () => {
    // A member can be granted read access to the organization it belongs to
    // without that being an invitation to edit it - only real update rights
    // (ownership, or a role granted `business:manage`) are.
    renderSwitcher({
      accountType: "MEMBER",
      organization: { ...organization, canRead: true, canUpdate: false },
    });
    openMenu();

    expect(screen.queryByRole("link", { name: /Acme/ })).toBeNull();
    expect(screen.getAllByText("Acme").length).toBeGreaterThan(0);
  });

  it("keeps the organization editable for a member granted real update rights on it", () => {
    // canUpdate already encodes "owner OR granted business:manage" - a
    // non-owner org admin must still see the edit affordance.
    renderSwitcher({
      accountType: "MEMBER",
      organization: { ...organization, canRead: true, canUpdate: true },
    });
    openMenu();

    expect(
      screen.getByRole("link", { name: /Acme/ }).getAttribute("href"),
    ).toBe("/organization?establishmentId=est-1");
  });

  it("hides the establishment entry points the account is not allowed to use", () => {
    renderSwitcher({ canCreateEstablishment: false, canReadEstablishments: false });
    openMenu();

    expect(screen.queryByRole("button", { name: "New establishment" })).toBeNull();
    expect(screen.queryByRole("button", { name: "All Establishments" })).toBeNull();
  });

  it("hides the search and the all-organizations entry with only one organization", () => {
    renderSwitcher();
    openMenu();

    expect(screen.queryByPlaceholderText("Find organization...")).toBeNull();
    expect(screen.queryByRole("button", { name: "All Organizations" })).toBeNull();
  });

  it("shows the search and the all-organizations entry once there is more than one organization", () => {
    renderSwitcher({
      establishments: [
        ...baseWorkspace.establishments,
        { id: "est-2", name: "Host branch", photoUrl: null, organizationId: "host-org-1", organizationName: "Host Org" },
      ],
    });
    openMenu();

    expect(screen.getByPlaceholderText("Find organization...")).toBeTruthy();
    expect(screen.getByRole("button", { name: "All Organizations" })).toBeTruthy();
  });

  it("navigates to the establishment creation screen", () => {
    renderSwitcher();
    openMenu();
    fireEvent.click(screen.getByRole("button", { name: "New establishment" }));

    expect(push).toHaveBeenCalledWith("/establishments/new");
  });

  it("offers to start a business only while the account owns no organization yet", () => {
    renderSwitcher({ accountType: "MEMBER", ownedOrganizationId: null });
    openMenu();

    expect(screen.getByRole("button", { name: /Create your own business/ })).toBeTruthy();
  });

  it("hides starting a business once the account already owns one", () => {
    // The same account can be a MEMBER of the currently active organization
    // while separately owning another - the button must not offer to create
    // a second one in that case.
    renderSwitcher({ accountType: "MEMBER", ownedOrganizationId: "own-org-1" });
    openMenu();

    expect(screen.queryByRole("button", { name: /Create your own business/ })).toBeNull();
  });

  it("grants full access when switching back into the organization the account owns", () => {
    const assign = vi.fn();
    Object.defineProperty(globalThis, "location", {
      value: { assign },
      writable: true,
    });

    // Currently browsing a foreign (host) organization as a member with no
    // matching permissions there, while the establishments list also carries
    // the account's own organization (with a different id) from elsewhere.
    renderSwitcher({
      accountType: "MEMBER",
      ownedOrganizationId: "own-org-1",
      organization: { id: "host-org-1", name: "Host Org", imageUrl: null },
      establishments: [
        { id: "est-1", name: "Host branch", photoUrl: null, organizationId: "host-org-1", organizationName: "Host Org" },
        { id: "own-est-1", name: "My branch", photoUrl: null, organizationId: "own-org-1", organizationName: "Acme" },
      ],
      activeEstablishmentId: "est-1",
    });
    fireEvent.click(screen.getByRole("combobox", { name: /Host branch/ }));
    fireEvent.click(screen.getByRole("button", { name: "Acme" }));

    // Full access to its own organization: the account stays on the current
    // screen rather than being routed away by a permission check meant for
    // foreign organizations.
    expect(assign).toHaveBeenCalledWith(expect.stringContaining("establishmentId=own-est-1"));
    expect(assign).toHaveBeenCalledWith(expect.stringMatching(/^\/schedule\?/));
  });
});
