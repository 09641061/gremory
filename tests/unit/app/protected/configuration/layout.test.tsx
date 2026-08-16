import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  headers: vi.fn(),
  workspace: {
    getHeaderViewModel: vi.fn(),
  },
  planHome: {
    handle: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
  headers: mocks.headers,
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.workspace,
}));

vi.mock("@/contexts/shared/application/internal/queryservices/plan-home-route-query.service", () => ({
  createPlanHomeRouteQueryService: () => mocks.planHome,
}));

import { resolveConfigurationBackHref } from "@/app/(protected)/(configuration)/layout";

describe("resolveConfigurationBackHref", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.headers.mockResolvedValue(new Headers([["x-takodu-establishment-id", "est-1"]]));
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      establishments: [
        { id: "est-1", name: "Main" },
      ],
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
      },
      ownedOrganizationId: "org-2",
      onboardingCompleted: true,
    });
    mocks.planHome.handle.mockResolvedValue("/chat");
  });

  it("prefers the active organization hub when it is the user's own organization", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "takodu.access_token") return { value: "token" };
        if (name === "takodu.active_organization_id") return { value: "org-2" };
        return null;
      }),
    });

    await expect(resolveConfigurationBackHref()).resolves.toBe("/organizations?organizationId=org-2");
  });

  it("includes the remembered preview organization when returning to the hub", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "takodu.access_token") return { value: "token" };
        if (name === "takodu.active_organization_id") return { value: "org-2" };
        if (name === "takodu.preview_organization_id") return { value: "org-3" };
        return null;
      }),
    });

    await expect(resolveConfigurationBackHref()).resolves.toBe(
      "/organizations?organizationId=org-2&previewOrganizationId=org-3",
    );
  });

  it("falls back to the app home when the active organization is invited", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "takodu.access_token") return { value: "token" };
        if (name === "takodu.active_organization_id") return { value: "org-1" };
        return null;
      }),
    });
    mocks.planHome.handle.mockResolvedValue("/access-denied");

    await expect(resolveConfigurationBackHref()).resolves.toBe("/access-denied");
  });

  it("falls back to the plan home route when there is no active organization", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "takodu.access_token") return { value: "token" };
        return null;
      }),
    });

    await expect(resolveConfigurationBackHref()).resolves.toBe("/chat");
  });
});
