/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrganizationListCard } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-list-card";

const organizations = [
  {
    organizationId: "org-1",
    organizationName: "Acme",
    organizationImageUrl: null,
    establishments: [],
  },
  {
    organizationId: "org-2",
    organizationName: "Studio",
    organizationImageUrl: null,
    establishments: [{ id: "est-1", name: "Main", photoUrl: null }],
  },
] as const;

describe("OrganizationListCard", () => {
  it("shows the selected badge only for the confirmed organization", () => {
    render(
      <OrganizationListCard
        filteredOrganizations={organizations}
        previewOrgId="org-1"
        activeOrganizationId="org-2"
        onPreview={() => {}}
      />,
    );

    expect(screen.getByText("Selected")).toBeTruthy();
    expect(screen.queryAllByText("Selected").length).toBe(1);
  });

  it("selects the organization when the row is clicked, without a separate confirm button", () => {
    const onPreview = vi.fn();
    render(
      <OrganizationListCard
        filteredOrganizations={organizations}
        previewOrgId={null}
        activeOrganizationId={null}
        onPreview={onPreview}
      />,
    );

    expect(screen.queryByRole("button", { name: /work in/i })).toBeNull();

    fireEvent.click(screen.getByText("Acme"));

    expect(onPreview).toHaveBeenCalledWith("org-1");
  });

  it("selects an organization with establishments in the same single step", () => {
    const onPreview = vi.fn();
    render(
      <OrganizationListCard
        filteredOrganizations={organizations}
        previewOrgId={null}
        activeOrganizationId={null}
        onPreview={onPreview}
      />,
    );

    fireEvent.click(screen.getByText("Studio"));

    expect(onPreview).toHaveBeenCalledWith("org-2");
  });
});
