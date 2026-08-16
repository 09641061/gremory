import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  cookies: vi.fn(),
  workspace: {
    getHeaderViewModel: vi.fn(),
  },
  organization: {
    getById: vi.fn(),
  },
  organizationsPage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.workspace,
}));

vi.mock("@/contexts/business/application/internal/queryservices/organization-query.service", () => ({
  createOrganizationQueryService: () => mocks.organization,
}));

vi.mock("@/contexts/business/interfaces/components/organization/organizations-page/organizations-page", () => ({
  OrganizationsPage: (props: unknown) => {
    mocks.organizationsPage(props);
    return null;
  },
}));

import OrganizationsRoutePage from "@/app/(protected)/(configuration)/organizations/page";

describe("OrganizationsRoutePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.cookies.mockResolvedValue({
      get: vi.fn(() => null),
    });
  });

  it("shows the owned organization even when it has no establishments", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "MEMBER",
      organization: {
        id: "host-org",
        name: "Host Org",
        imageUrl: null,
        canRead: true,
        canUpdate: false,
        canReadEstablishments: true,
        canCreateEstablishment: false,
      },
      establishments: [
        {
          id: "host-est-1",
          name: "Host branch",
          photoUrl: null,
          organizationId: "host-org",
          organizationName: "Host Org",
        },
      ],
      ownedOrganizationId: "own-org",
    });
    mocks.organization.getById.mockResolvedValue({
      id: "own-org",
      ownerId: "user-1",
      name: "My Studio",
      imageUrl: null,
    });

    const element = await OrganizationsRoutePage({
      searchParams: Promise.resolve({ organizationId: "own-org" }),
    });

    expect(element).toMatchObject({
      props: expect.objectContaining({
        ownedOrganizationId: "own-org",
        initialPreviewOrganizationId: "own-org",
        activeOrganizationId: "host-org",
        organizations: expect.arrayContaining([
          expect.objectContaining({
            organizationId: "host-org",
          }),
          expect.objectContaining({
            organizationId: "own-org",
            organizationName: "My Studio",
            establishments: [],
          }),
        ]),
      }),
    });
  });

  it("restores the last previewed organization when the back link sends it", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "MEMBER",
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
      ownedOrganizationId: "own-org",
    });
    mocks.organization.getById.mockResolvedValue({
      id: "own-org",
      ownerId: "user-1",
      name: "My Studio",
      imageUrl: null,
    });

    const element = await OrganizationsRoutePage({
      searchParams: Promise.resolve({
        organizationId: "host-org",
        previewOrganizationId: "own-org",
      }),
    });

    expect(element).toMatchObject({
      props: expect.objectContaining({
        initialPreviewOrganizationId: "own-org",
      }),
    });
  });
});
