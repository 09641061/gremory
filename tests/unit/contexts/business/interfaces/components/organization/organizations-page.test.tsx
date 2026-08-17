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
  OrganizationsSearchBar: () => null,
}));

vi.mock("@/contexts/business/interfaces/components/organization/organizations-page/organization-list-card", () => ({
  OrganizationListCard: ({ organizations, onConfirm }: { organizations: Array<{ organizationId: string }>; onConfirm: (id: string) => void }) => (
    <button type="button" onClick={() => onConfirm(organizations[0].organizationId)}>
      Work in
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

  it("navigates to establishment setup when the confirmed organization is owned and empty", () => {
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

    fireEvent.click(screen.getByRole("button", { name: "Work in" }));

    expect(mocks.router.push).toHaveBeenCalledWith("/establishments/setup?organizationId=org-1");
  });

  it("returns to the app home when the confirmed organization already has establishments", () => {
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

    fireEvent.click(screen.getByRole("button", { name: "Work in" }));

    expect(mocks.router.push).toHaveBeenCalledWith("/");
  });
});
