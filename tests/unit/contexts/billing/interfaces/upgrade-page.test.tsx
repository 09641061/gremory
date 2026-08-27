import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  cookies: vi.fn(),
  headers: vi.fn(),
  subscription: { getCurrentSubscriptionSnapshot: vi.fn() },
  workspace: { resolve: vi.fn() },
  businessWorkspace: { getHeaderViewModel: vi.fn() },
  plans: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies, headers: mocks.headers }));
vi.mock("@/contexts/billing/application/internal/queryservices/current-subscription-query.service", () => ({
  createCurrentSubscriptionQueryService: () => mocks.subscription,
}));
vi.mock("@/contexts/shared/application/internal/queryservices/app-shell-query.service", () => ({
  createAppShellQueryService: () => mocks.workspace,
}));
vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.businessWorkspace,
}));
vi.mock("@/contexts/billing/application/internal/queryservices/list-plans-query.service", () => ({
  listPlansByCurrencyQueryService: mocks.plans,
}));

import UpgradePage from "@/app/(protected)/upgrade/page";

describe("UpgradePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.cookies.mockResolvedValue({ get: () => ({ value: "access-token" }) });
    mocks.headers.mockResolvedValue(new Headers([["x-takodu-establishment-id", "est-1"]]));
    mocks.workspace.resolve.mockResolvedValue({ homeHref: "/chat" });
    mocks.businessWorkspace.getHeaderViewModel.mockResolvedValue({
      accessPolicy: { canManageBilling: false },
    });
  });

  it("redirects from the dynamic content when the workspace does not allow billing", async () => {
    const page = UpgradePage();
    await expect(page.props.children.type()).rejects.toThrow("REDIRECT:/chat");
    expect(mocks.plans).not.toHaveBeenCalled();
  });
});
