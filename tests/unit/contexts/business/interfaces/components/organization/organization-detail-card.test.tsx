/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
}));

vi.mock("@/contexts/business/interfaces/actions/organization.actions", () => ({
  updateOrganizationAction: vi.fn().mockResolvedValue({ status: "idle", data: null, error: null }),
}));

import { OrganizationDetailCard } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-detail-card";

describe("OrganizationDetailCard", () => {
  beforeEach(() => {
    mocks.push.mockClear();
  });

  it("shows a placeholder when no organization is selected", () => {
    render(<OrganizationDetailCard organization={null} ownedOrganizationId={null} />);

    expect(screen.getByText("Select an organization")).toBeDefined();
  });

  it("renders only the identity editor for the selected organization", () => {
    render(
      <OrganizationDetailCard
        organization={{
          organizationId: "org-1",
          organizationName: "Acme",
          organizationImageUrl: null,
          canUpdate: true,
          establishments: [{ id: "est-1", name: "Main Store", photoUrl: null }],
        }}
        ownedOrganizationId="org-1"
      />,
    );

    expect(screen.getByText("Organization Name")).toBeDefined();
    expect(screen.queryByText("Main Store")).toBeNull();
    expect(screen.queryByText("Establishments")).toBeNull();
  });
});
