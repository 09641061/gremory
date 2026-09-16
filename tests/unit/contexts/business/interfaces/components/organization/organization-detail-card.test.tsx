/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("OrganizationDetailCard tabs", () => {
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

  it("renders the four tabs with General active by default", () => {
    render(
      <OrganizationDetailCard
        organization={organization}
        ownedOrganizationId={organization.organizationId}
      />,
    );

    for (const label of ["General", "Members", "Roles", "Establishments"]) {
      expect(screen.getByRole("tab", { name: label })).toBeVisible();
    }

    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute("data-active");
    expect(screen.getByDisplayValue("OrganizationOne")).toBeVisible();
  });

  it("swaps the right panel content when a tab is selected", async () => {
    render(
      <OrganizationDetailCard
        organization={organization}
        ownedOrganizationId={organization.organizationId}
      />,
    );

    await userEvent.click(screen.getByRole("tab", { name: "Members" }));
    expect(await screen.findByRole("button", { name: /Invite member/ })).toBeVisible();

    await userEvent.click(screen.getByRole("tab", { name: "Roles" }));
    expect(
      await screen.findByRole("button", { name: /Create custom role/ }),
    ).toBeVisible();

    await userEvent.click(screen.getByRole("tab", { name: "Establishments" }));
    expect(await screen.findByRole("button", { name: /Create establishment/ })).toBeVisible();
  });
});
