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

const organization = { id: "org-1", name: "Acme", imageUrl: "https://cdn.test/acme.png" };

const baseWorkspace: WorkspaceHeaderViewModel = {
  accountType: "OWNER",
  onboardingStatus: "COMPLETED",
  onboardingCompleted: true,
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
    ).toBe("/organization");
  });

  it("keeps the organization out of the menu when the account cannot read it", () => {
    renderSwitcher({ canReadOrganization: false });
    openMenu();

    expect(screen.queryByRole("link", { name: /Acme/ })).toBeNull();
  });

  it("hides the establishment entry points the account is not allowed to use", () => {
    renderSwitcher({ canCreateEstablishment: false, canReadEstablishments: false });
    openMenu();

    expect(screen.queryByRole("button", { name: "New establishment" })).toBeNull();
    expect(screen.queryByRole("button", { name: "All Establishments" })).toBeNull();
  });

  it("navigates to the establishment creation screen", () => {
    renderSwitcher();
    openMenu();
    fireEvent.click(screen.getByRole("button", { name: "New establishment" }));

    expect(push).toHaveBeenCalledWith("/establishments/new");
  });
});
