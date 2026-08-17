/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  workspace: {
    getHeaderViewModel: vi.fn(),
  },
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.workspace,
}));

import EstablishmentSetupPage from "@/app/(protected)/(app)/establishments/setup/page";

describe("EstablishmentSetupPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows the onboarding guidance for a ready organization without establishments", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "OWNER",
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
      },
      establishments: [],
      canCreateEstablishment: true,
    });

    const element = await EstablishmentSetupPage({
      searchParams: Promise.resolve({ organizationId: "org-1" }),
    });
    render(element);

    expect(screen.getByText("Set up your first establishment")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Create establishment" })).toHaveAttribute(
      "href",
      "/establishments/new?organizationId=org-1",
    );
  });

  it("keeps the setup guidance when the first establishment capability is not present", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "OWNER",
      organization: { id: "org-1", name: "Acme", imageUrl: null },
      establishments: [],
      canCreateEstablishment: false,
    });

    const element = await EstablishmentSetupPage({
      searchParams: Promise.resolve({ organizationId: "org-1" }),
    });
    render(element);

    expect(screen.getByText("Set up your first establishment")).toBeTruthy();
  });
});
