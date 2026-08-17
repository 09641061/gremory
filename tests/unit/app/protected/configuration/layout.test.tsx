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

  it("returns to the active organization context in the app", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "takodu.access_token") return { value: "token" };
        if (name === "takodu.active_organization_id") return { value: "org-2" };
        return null;
      }),
    });

    await expect(resolveConfigurationBackHref()).resolves.toBe("/?organizationId=org-2&establishmentId=est-1");
  });

  it("returns to the active organization context instead of the hub", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "takodu.access_token") return { value: "token" };
        if (name === "takodu.active_organization_id") return { value: "org-2" };
        if (name === "takodu.preview_organization_id") return { value: "org-3" };
        return null;
      }),
    });

    await expect(resolveConfigurationBackHref()).resolves.toBe("/?organizationId=org-2&establishmentId=est-1");
  });

  it("returns to the invited organization's active context", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === "takodu.access_token") return { value: "token" };
        if (name === "takodu.active_organization_id") return { value: "org-1" };
        return null;
      }),
    });
    await expect(resolveConfigurationBackHref()).resolves.toBe("/?organizationId=org-1&establishmentId=est-1");
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
