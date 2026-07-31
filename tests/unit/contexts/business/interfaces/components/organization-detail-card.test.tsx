/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OrganizationDetailCard } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-detail-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/contexts/business/interfaces/actions/organization.actions", () => ({
  updateOrganizationAction: vi.fn().mockResolvedValue({
    status: "success",
    error: null,
  }),
}));

describe("OrganizationDetailCard Component", () => {
  const mockOrganization = {
    id: "org-123",
    name: "Test Organization",
    imageUrl: "http://example.com/logo.jpg",
    ownerId: "owner-123",
  };

  it("renders detail card when organization is selected (Happy Case - Edit allowed)", () => {
    render(
      <OrganizationDetailCard
        organization={mockOrganization}
        canUpdate={true}
        onCancel={vi.fn()}
      />
    );

    // Verify header and fields are shown
    expect(screen.getByText("Organization Name")).toBeDefined();
    
    // Verify inputs are enabled
    const input = screen.getByPlaceholderText("Organization name") as HTMLInputElement;
    expect(input.disabled).toBe(false);
    expect(input.value).toBe("Test Organization");

    // Verify action buttons are visible
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
  });

  it("renders detail card as read-only when user lacks update permission (Unhappy Case - Read only)", () => {
    render(
      <OrganizationDetailCard
        organization={mockOrganization}
        canUpdate={false}
        onCancel={vi.fn()}
      />
    );

    // Verify fields are shown
    expect(screen.getByText("Organization Name")).toBeDefined();

    // Verify inputs are disabled
    const input = screen.getByPlaceholderText("Organization name") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    // Verify action buttons are not rendered
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
