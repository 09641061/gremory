/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { EstablishmentSelector } from "@/contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector";
import { OrganizationSelector } from "@/contexts/business/interfaces/components/organization/organization-selector/organization-selector";

const establishments = [{ id: "est-1", name: "Main branch", photoUrl: null }];
const organizations = [{ id: "org-1", name: "Acme", imageUrl: null }];

function openMenu(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
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

  it("hides the organization creation entry point when the user already owns one", () => {
    render(<OrganizationSelector organization={organizations[0]} organizations={organizations} />);

    openMenu(/Acme/);

    expect(screen.queryByRole("button", { name: "New organization" })).toBeNull();
  });

  it("shows the organization creation entry point when a handler is provided", () => {
    const onNew = vi.fn();
    render(
      <OrganizationSelector
        organization={organizations[0]}
        organizations={organizations}
        onNew={onNew}
      />,
    );

    openMenu(/Acme/);
    fireEvent.click(screen.getByRole("button", { name: "New organization" }));

    expect(onNew).toHaveBeenCalledOnce();
  });
});
