/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { EstablishmentSelector } from "@/contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector";
import { OrganizationLabel } from "@/contexts/business/interfaces/components/organization/organization-label/organization-label";

const establishments = [{ id: "est-1", name: "Main branch", photoUrl: null }];
const organization = { name: "Acme", imageUrl: null };

function openMenu(name: RegExp) {
  fireEvent.click(screen.getByRole("combobox", { name }));
}

describe("workspace selectors", () => {
  it("hides the establishment creation entry point when creation is not allowed", () => {
    render(
      <EstablishmentSelector
        establishments={establishments}
        selectedEstablishmentId="est-1"
        onSelect={vi.fn()}
      />,
    );

    openMenu(/Main branch/);

    expect(screen.queryByRole("button", { name: "New establishment" })).toBeNull();
    expect(screen.queryByRole("button", { name: "All Establishments" })).toBeNull();
  });

  it("shows the establishment creation entry point when a handler is provided", () => {
    const onNew = vi.fn();
    render(
      <EstablishmentSelector
        establishments={establishments}
        selectedEstablishmentId="est-1"
        onSelect={vi.fn()}
        onNew={onNew}
      />,
    );

    openMenu(/Main branch/);
    fireEvent.click(screen.getByRole("button", { name: "New establishment" }));

    expect(onNew).toHaveBeenCalledOnce();
  });

  it("links the organization to its settings instead of offering a switcher", () => {
    render(<OrganizationLabel organization={organization} href="/organization" />);

    // The organization is fixed for the account: there is nothing to switch to,
    // but clicking it opens the screen where its name and logo are edited.
    expect(screen.getByRole("link", { name: /Acme/ }).getAttribute("href")).toBe("/organization");
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("renders the organization as plain text when the account cannot read it", () => {
    render(<OrganizationLabel organization={organization} />);

    expect(screen.getByText("Acme")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
