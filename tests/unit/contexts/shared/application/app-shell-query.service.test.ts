import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  shell: {
    workspace: {
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
        defaultEstablishmentId: "est-1",
      },
      organizations: [
        {
          id: "org-1",
          name: "Acme",
          imageUrl: null,
          defaultEstablishmentId: "est-1",
        },
      ],
      establishments: [
        {
          id: "est-1",
          name: "Main",
          photoUrl: null,
        },
      ],
      activeOrganizationId: "org-1",
      activeEstablishmentId: "est-1",
      accessPolicy: {
        canOpenAnalytics: true,
        canOpenScheduling: true,
        canOpenCrm: true,
        canOpenCatalog: true,
        canOpenTeam: true,
        canCreateEstablishment: true,
        canManageBilling: true,
      },
      capabilities: {
        canReadAnalytics: true,
      },
      canReadOrganizations: true,
      canReadEstablishments: true,
      canCreateEstablishment: true,
    },
  },
  subscription: {
    resolve: vi.fn(),
  },
  workspace: {
    getHeaderViewModel: vi.fn(),
  },
  catalog: {
    getPermissions: vi.fn(),
  },
  crm: {
    getPermissions: vi.fn(),
  },
  scheduling: {
    getPermissions: vi.fn(),
  },
  workforce: {
    getPermissions: vi.fn(),
  },
}));

vi.mock(
  "@/contexts/business/application/internal/queryservices/business-workspace-query.service",
  () => ({
    createBusinessWorkspaceQueryService: () => mocks.workspace,
  }),
);

vi.mock(
  "@/contexts/billing/application/internal/queryservices/subscription-access-query.service",
  () => ({
    createSubscriptionAccessQueryService: () => mocks.subscription,
  }),
);

vi.mock(
  "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service",
  () => ({
    createCatalogAccessPolicyService: () => mocks.catalog,
  }),
);

vi.mock(
  "@/contexts/crm/application/internal/queryservices/crm-access-policy.service",
  () => ({
    createCrmAccessPolicyService: () => mocks.crm,
  }),
);

vi.mock(
  "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service",
  () => ({
    createSchedulingAccessPolicyService: () => mocks.scheduling,
  }),
);

vi.mock(
  "@/contexts/workforce/application/internal/queryservices/workforce-access-policy.service",
  () => ({
    createWorkforceAccessPolicyService: () => mocks.workforce,
  }),
);

import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";

describe("app shell query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.shell.workspace.accessPolicy = {
      canOpenAnalytics: true,
      canOpenScheduling: true,
      canOpenCrm: true,
      canOpenCatalog: true,
      canOpenTeam: true,
      canCreateEstablishment: true,
      canManageBilling: true,
    };
    mocks.shell.workspace.capabilities = {
      canReadAnalytics: true,
    };
    mocks.subscription.resolve.mockReturnValue({
      isActive: true,
      hasAssistantAccess: true,
      homeHref: "/chat",
    });
    mocks.workspace.getHeaderViewModel.mockResolvedValue(mocks.shell.workspace);
    mocks.catalog.getPermissions.mockResolvedValue({ canReadCatalog: true });
    mocks.crm.getPermissions.mockResolvedValue({ canReadCustomers: true });
    mocks.scheduling.getPermissions.mockResolvedValue({ canReadAppointments: true });
    mocks.workforce.getPermissions.mockResolvedValue({ canReadTeam: true });
  });

  it("resolves the sidebar routes from application policies instead of UI labels", async () => {
    const shell = await createAppShellQueryService().resolve({ subscription: { active: true, status: "ACTIVE", planId: 1 } });

    expect(shell.hasAssistantAccess).toBe(true);
    expect(shell.visibleSidebarRoutes).toEqual([
      "/chat",
      "/schedule",
      "/crm",
      "/catalog",
      "/team",
      "/analytics",
    ]);
  });

  it("hides assistant navigation when the plan is free", async () => {
    mocks.subscription.resolve.mockReturnValue({
      isActive: true,
      hasAssistantAccess: false,
      homeHref: "/schedule",
    });

    const shell = await createAppShellQueryService().resolve({ subscription: { active: true, status: "ACTIVE", planId: 0 } });

    expect(shell.hasAssistantAccess).toBe(false);
    expect(shell.visibleSidebarRoutes).toEqual([
      "/schedule",
      "/crm",
      "/catalog",
      "/team",
      "/analytics",
    ]);
  });

  it("hides schedule and team when their read capabilities are denied", async () => {
    mocks.shell.workspace.accessPolicy = {
      ...mocks.shell.workspace.accessPolicy,
      canOpenScheduling: false,
      canOpenTeam: false,
    };

    const shell = await createAppShellQueryService().resolve({
      subscription: { active: true, status: "ACTIVE", planId: 1 },
    });

    expect(shell.visibleSidebarRoutes).toEqual([
      "/chat",
      "/crm",
      "/catalog",
      "/analytics",
    ]);
  });

  it("hides analytics when the workspace capability denies it", async () => {
    mocks.shell.workspace.accessPolicy = { ...mocks.shell.workspace.accessPolicy, canOpenAnalytics: false };

    const shell = await createAppShellQueryService().resolve({
      subscription: { active: true, status: "ACTIVE", planId: 1 },
    });

    expect(shell.visibleSidebarRoutes).toEqual([
      "/chat",
      "/schedule",
      "/crm",
      "/catalog",
      "/team",
    ]);
  });

  it("hides analytics when the workspace capability is missing", async () => {
    delete (mocks.shell.workspace as { capabilities?: { canReadAnalytics: boolean } }).capabilities;
    delete (mocks.shell.workspace as { accessPolicy?: { canOpenAnalytics: boolean } }).accessPolicy;

    const shell = await createAppShellQueryService().resolve({
      subscription: { active: true, status: "ACTIVE", planId: 1 },
    });

    expect(shell.visibleSidebarRoutes).toEqual([
      "/chat",
    ]);
  });
});
