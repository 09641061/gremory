/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OrganizationSettingsCard } from "@/contexts/business/interfaces/components/organization/organization-settings/organization-settings-card";

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

describe("OrganizationSettingsCard", () => {
  const organization = {
    id: "org-123",
    name: "Test Organization",
    imageUrl: "https://picsum.photos/seed/replik-test/800/600",
  };

  it("lets an account with update permission edit its organization", () => {
    render(
      <OrganizationSettingsCard
        organization={organization}
        canUpdate={true}
      />,
    );

    expect(screen.getByText("Organization Name")).toBeDefined();

    const input = screen.getByPlaceholderText("Organization name") as HTMLInputElement;
    expect(input.disabled).toBe(false);
    expect(input.value).toBe("Test Organization");

    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
  });

  it("renders read-only when the account lacks update permission", () => {
    render(
      <OrganizationSettingsCard
        organization={organization}
        canUpdate={false}
      />,
    );

    const input = screen.getByPlaceholderText("Organization name") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

});
