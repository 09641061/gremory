/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/contexts/business/interfaces/actions/organization.actions", () => ({
  updateOrganizationAction: vi.fn(),
}));
vi.mock("@/contexts/business/interfaces/actions/establishment.actions", () => ({
  createEstablishmentAction: vi.fn(),
  updateEstablishmentAction: vi.fn(),
  deleteEstablishmentAction: vi.fn(),
}));

import { OrganizationDetailCard } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-detail-card";

const organization = {
  organizationId: "11111111-1111-4111-8111-111111111111",
  organizationName: "OrganizationOne",
  organizationImageUrl: null,
  establishments: [],
  canUpdate: true,
};

describe("OrganizationDetailCard sections", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.startsWith("/api/workforce/roles")) {
        return Promise.resolve(new Response("[]", { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({
        content: [],
        page: 0,
        size: 100,
        totalElements: 0,
        totalPages: 1,
      }), { status: 200 }));
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it("renders no horizontal tab bar and shows the Organization panel by default", () => {
    render(
      <OrganizationDetailCard
        organization={organization}
        ownedOrganizationId={organization.organizationId}
        activeSection="organization"
      />,
    );

    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.getByDisplayValue("OrganizationOne")).toBeVisible();
    // Inactive panels stay mounted but hidden from the accessibility tree.
    expect(screen.queryByRole("button", { name: /Invite member/ })).toBeNull();
  });

  it("renders the panel matching the controlled section", async () => {
    const { rerender } = render(
      <OrganizationDetailCard
        organization={organization}
        ownedOrganizationId={organization.organizationId}
        activeSection="members"
      />,
    );
    expect(await screen.findByPlaceholderText("Search members...")).toBeVisible();

    rerender(
      <OrganizationDetailCard
        organization={organization}
        ownedOrganizationId={organization.organizationId}
        activeSection="invites"
      />,
    );
    expect(await screen.findByRole("button", { name: /Invite member/ })).toBeVisible();

    rerender(
      <OrganizationDetailCard
        organization={organization}
        ownedOrganizationId={organization.organizationId}
        activeSection="roles"
      />,
    );
    expect(await screen.findByRole("button", { name: /Create custom role/ })).toBeVisible();

    rerender(
      <OrganizationDetailCard
        organization={organization}
        ownedOrganizationId={organization.organizationId}
        activeSection="establishments"
      />,
    );
    expect(await screen.findByRole("button", { name: /Create establishment/ })).toBeVisible();
  });
});
