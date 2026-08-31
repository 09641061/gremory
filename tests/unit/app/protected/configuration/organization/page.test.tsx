import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  workspace: {
    getHeaderViewModel: vi.fn(),
    getOrganizationPageState: vi.fn(),
  },
  organization: {
    getById: vi.fn(),
  },
  settingsCard: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.workspace,
}));

vi.mock("@/contexts/business/application/internal/queryservices/organization-query.service", () => ({
  createOrganizationQueryService: () => mocks.organization,
}));

vi.mock("@/contexts/business/interfaces/components/organization/organization-settings/organization-settings-card", () => ({
  OrganizationSettingsCard: (props: unknown) => {
    mocks.settingsCard(props);
    return null;
  },
}));

import OrganizationRoutePage from "@/app/(protected)/(configuration)/organization/page";

describe("OrganizationRoutePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("opens the owned organization directly when the query points to it", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      ownedOrganizationId: "own-org",
      organization: {
        id: "host-org",
        name: "Host Org",
        imageUrl: null,
        canRead: true,
        canUpdate: false,
        canReadEstablishments: true,
        canCreateEstablishment: false,
      },
      establishments: [],
    });
    mocks.organization.getById.mockResolvedValue({
      id: "own-org",
      ownerId: "user-1",
      name: "My Studio",
      imageUrl: null,
    });

    const element = await OrganizationRoutePage({
      searchParams: Promise.resolve({ organizationId: "own-org" }),
    });

    expect(element).toMatchObject({
      props: expect.objectContaining({
        organization: {
          id: "own-org",
          name: "My Studio",
          imageUrl: null,
        },
        canUpdate: true,
      }),
    });
  });
});
