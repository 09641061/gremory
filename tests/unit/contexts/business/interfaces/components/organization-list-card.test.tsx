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
        organizations={organizations}
        filteredOrganizations={organizations}
        previewOrgId="org-1"
        previewOrganization={organizations[0]}
        activeOrganizationId="org-2"
        ownedOrganizationId="org-1"
        onPreview={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.getByText("Selected")).toBeTruthy();
    expect(screen.queryAllByText("Selected").length).toBe(1);
  });

  it("confirms the selected organization even when it has no establishments", () => {
    const onConfirm = vi.fn();
    render(
      <OrganizationListCard
        organizations={organizations}
        filteredOrganizations={organizations}
        previewOrgId="org-1"
        previewOrganization={organizations[0]}
        activeOrganizationId="org-2"
        ownedOrganizationId="org-1"
        onPreview={() => {}}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /continue with acme/i }));

    expect(onConfirm).toHaveBeenCalledWith("org-1");
  });

  it("confirms the selected organization when there is one establishment", () => {
    const onConfirm = vi.fn();
    render(
      <OrganizationListCard
        organizations={organizations}
        filteredOrganizations={organizations}
        previewOrgId="org-2"
        previewOrganization={organizations[1]}
        activeOrganizationId="org-2"
        ownedOrganizationId="org-1"
        onPreview={() => {}}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /continue with studio/i }));

    expect(onConfirm).toHaveBeenCalledWith("org-2");
  });
});
