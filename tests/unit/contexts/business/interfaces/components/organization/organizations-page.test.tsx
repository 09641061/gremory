/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/contexts/business/interfaces/components/organization/organizations-page/organization-detail-card",
  () => ({
    OrganizationDetailCard: ({ activeSection }: { activeSection: string }) => (
      <div data-testid="active-section">{activeSection}</div>
    ),
  }),
);

import { OrganizationsPage } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page";

const organizationId = "11111111-1111-4111-8111-111111111111";
const organizations = [
  {
    organizationId,
    organizationName: "OrganizationOne",
    organizationImageUrl: null,
    canUpdate: true,
    canCreateEstablishment: true,
    establishments: [],
  },
];

describe("OrganizationsPage settings layout", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the internal sidebar with four sections and no organization search column", () => {
    render(
      <OrganizationsPage
        organizations={organizations}
        ownedOrganizationId={organizationId}
        activeOrganizationId={organizationId}
        canCreateOrganization
      />,
    );

    expect(screen.getByText("Organization Settings")).toBeVisible();
    for (const label of ["Organization", "Establishments", "Members", "Invites", "Roles"]) {
      expect(screen.getByRole("button", { name: label })).toBeVisible();
    }

    // The old left column (search + list selector) is gone.
    expect(screen.queryByPlaceholderText("Search organizations")).toBeNull();
    expect(screen.getByRole("link", { name: /New organization/ })).toBeVisible();
  });

  it("switches the active section through the sidebar buttons", async () => {
    render(
      <OrganizationsPage
        organizations={organizations}
        ownedOrganizationId={organizationId}
        activeOrganizationId={organizationId}
      />,
    );

    expect(screen.getByTestId("active-section")).toHaveTextContent("organization");
    expect(screen.getByRole("button", { name: "Organization" })).toHaveAttribute("aria-current", "page");

    await userEvent.click(screen.getByRole("button", { name: "Members" }));

    expect(screen.getByTestId("active-section")).toHaveTextContent("members");
    expect(screen.getByRole("button", { name: "Members" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Organization" })).not.toHaveAttribute("aria-current");
    // The create-organization link is hidden without the capability.
    expect(screen.queryByRole("link", { name: /New organization/ })).toBeNull();
  });
});
