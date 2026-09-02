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
  imageUrl: "https://picsum.photos/seed/replik-test/800/600",
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
    { id: "est-1", name: "Main branch", photoUrl: "https://picsum.photos/seed/replik-test/800/600" },
  ],
  activeEstablishmentId: "est-1",
  canReadOrganization: true,
  canReadEstablishments: true,
  canCreateEstablishment: true,
  canCreateOrganization: false,
};

function renderSwitcher(workspace: Partial<WorkspaceHeaderViewModel> = {}) {
  render(<WorkspaceSwitcher workspace={{ ...baseWorkspace, ...workspace }} />);
}

function openMenu(name = /Main branch/) {
  fireEvent.click(screen.getByRole("combobox", { name }));
}

describe("OrganizationBadge", () => {
  it("opens the organizations hub instead of the old organization editor", () => {
    render(<OrganizationBadge organization={organization} href="/organizations" />);

    expect(screen.getByRole("link", { name: /Acme/ }).getAttribute("href")).toBe(
      "/organizations",
    );
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

  it("opens the organizations hub from the header badge", () => {
    renderSwitcher();
    openMenu();

    expect(
      screen.getByRole("link", { name: /Acme/ }).getAttribute("href"),
    ).toBe("/organizations");
  });

  it("still opens the organizations hub when the account cannot read the organization", () => {
    renderSwitcher({ organization: { ...organization, canRead: false, canUpdate: false } });
    openMenu();

    expect(
      screen.getByRole("link", { name: /Acme/ }).getAttribute("href"),
    ).toBe("/organizations");
  });

  it("keeps the establishment entry points the account is not allowed to use hidden", () => {
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

  it("keeps establishment switching working", () => {
    const assign = vi.fn();
    Object.defineProperty(globalThis, "location", {
      value: { assign },
      writable: true,
    });

    renderSwitcher({
      accountType: "MEMBER",
      establishments: [
        { id: "est-1", name: "Main branch", photoUrl: null },
        { id: "est-2", name: "Second branch", photoUrl: null },
      ],
      activeEstablishmentId: "est-1",
    });
    openMenu();
    fireEvent.click(screen.getByText("Second branch"));

    expect(assign).toHaveBeenCalledWith(expect.stringContaining("establishmentId=est-2"));
    expect(assign).toHaveBeenCalledWith(expect.stringMatching(/^\/schedule\?/));
  });
});
