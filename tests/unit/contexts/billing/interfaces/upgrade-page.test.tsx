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
vi.mock("@/contexts/billing/interfaces/server/billing-composition", () => ({
  composeBillingAdapters: () => ({
    currentSubscriptionService: mocks.subscription,
    listPlansService: {},
  }),
}));
vi.mock("@/contexts/shared/application/internal/queryservices/app-shell-query.service", () => ({
  createAppShellQueryService: () => mocks.workspace,
}));
vi.mock("@/contexts/business/interfaces/server/business-composition", () => ({
  composeBusinessAdapters: () => ({
    workspaceQueryService: mocks.businessWorkspace,
  }),
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
      organization: { id: "org-1" },
    });
  });

  it("renders SubscribeView when billing is managed by the owner", async () => {
    mocks.businessWorkspace.getHeaderViewModel.mockResolvedValue({
      accessPolicy: { canManageBilling: true },
      organization: { id: "org-1" },
    });
    mocks.subscription.getCurrentSubscriptionSnapshot.mockResolvedValue(null);
    mocks.plans.mockResolvedValue({});

    const page = UpgradePage();
    const rendered = await page.props.children.type({ params: {} });
    expect(mocks.plans).toHaveBeenCalled();
    expect(rendered).toBeTruthy();
  });
});
