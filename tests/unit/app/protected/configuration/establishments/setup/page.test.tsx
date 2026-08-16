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

import EstablishmentSetupPage from "@/app/(protected)/(configuration)/establishments/setup/page";

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

    const element = await EstablishmentSetupPage();
    render(element);

    expect(screen.getByText("Set up your first establishment")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Create establishment" })).toBeTruthy();
  });
});
