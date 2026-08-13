/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { WorkspaceSwitcher } from "@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/schedule",
  useSearchParams: () => new URLSearchParams(),
}));

const baseWorkspace: WorkspaceHeaderViewModel = {
  accountType: "OWNER",
  organization: { id: "org-1", name: "Acme", imageUrl: null },
  establishments: [{ id: "est-1", name: "Main branch", photoUrl: null }],
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

describe("WorkspaceSwitcher", () => {
  it("shows the organization as the caption of the active establishment", () => {
    renderSwitcher();

    // One control, not two: the organization is fixed for the account, so it
    // reads as context for the establishment rather than as a second selector.
    const trigger = screen.getByRole("combobox", { name: /Main branch/ });
    expect(trigger.textContent).toContain("Acme");
    expect(trigger.textContent).toContain("Main branch");
  });

  it("offers the organization settings inside the menu when the account can read it", () => {
    renderSwitcher();
    openMenu();

    expect(
      screen.getByRole("link", { name: /Organization settings/ }).getAttribute("href"),
    ).toBe("/organization");
  });

  it("hides the organization settings when the account cannot read it", () => {
    renderSwitcher({ canReadOrganization: false });
    openMenu();

    expect(screen.queryByRole("link", { name: /Organization settings/ })).toBeNull();
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
