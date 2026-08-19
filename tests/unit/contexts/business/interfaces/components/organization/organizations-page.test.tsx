/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));

vi.mock("@/contexts/business/interfaces/components/organization/organizations-page/organizations-search-bar", () => ({
  OrganizationsSearchBar: ({ canCreate }: { canCreate?: boolean }) =>
    canCreate ? <a href="/organizations/new">New organization</a> : null,
}));

vi.mock("@/contexts/business/interfaces/components/organization/organizations-page/organization-list-card", () => ({
  OrganizationListCard: ({ filteredOrganizations, onPreview }: { filteredOrganizations: Array<{ organizationId: string }>; onPreview: (id: string) => void }) => (
    <button type="button" onClick={() => onPreview(filteredOrganizations[0].organizationId)}>
      Select organization
    </button>
  ),
}));

vi.mock("@/contexts/business/interfaces/components/organization/organizations-page/organization-detail-card", () => ({
  OrganizationDetailCard: () => null,
}));

import { OrganizationsPage } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page";

describe("OrganizationsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    document.cookie = "takodu.active_organization_id=; path=/; max-age=0";
    document.cookie = "takodu.preview_organization_id=; path=/; max-age=0";
  });

  it("navigates to establishment setup when the selected organization is owned and empty", () => {
    render(
      <OrganizationsPage
        organizations={[
          {
            organizationId: "org-1",
            organizationName: "Acme",
            organizationImageUrl: null,
            establishments: [],
          },
        ]}
        ownedOrganizationId="org-1"
        activeOrganizationId={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select organization" }));

    expect(mocks.router.push).toHaveBeenCalledWith("/establishments/setup?organizationId=org-1");
  });

  it("returns to the app home when the selected organization already has establishments", () => {
    render(
      <OrganizationsPage
        organizations={[
          {
            organizationId: "org-1",
            organizationName: "Acme",
            organizationImageUrl: null,
            establishments: [{ id: "est-1", name: "Main", photoUrl: null }],
          },
        ]}
        ownedOrganizationId="org-1"
        activeOrganizationId={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select organization" }));

    expect(mocks.router.push).toHaveBeenCalledWith("/?organizationId=org-1&establishmentId=est-1");
  });

  it("hides New organization link when the account already owns an organization", () => {
    render(
      <OrganizationsPage
        organizations={[
          {
            organizationId: "org-1",
            organizationName: "Acme",
            organizationImageUrl: null,
            establishments: [],
          },
        ]}
        ownedOrganizationId="org-1"
        activeOrganizationId={null}
        canCreateOrganization={false}
      />,
    );

    expect(screen.queryByRole("link", { name: "New organization" })).toBeNull();
  });

  it("shows New organization link for an account that owns no organization yet", () => {
    render(
      <OrganizationsPage
        organizations={[]}
        ownedOrganizationId={null}
        activeOrganizationId={null}
        canCreateOrganization={true}
      />,
    );

    expect(screen.getByRole("link", { name: "New organization" })).toBeDefined();
  });
});
