import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  workspace: {
    getHeaderViewModel: vi.fn(),
  },
  organization: {
    getById: vi.fn(),
  },
  form: vi.fn(),
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

vi.mock("@/contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form", () => ({
  CreateEstablishmentForm: (props: unknown) => {
    mocks.form(props);
    return null;
  },
}));

import NewEstablishmentPage from "@/app/(protected)/(configuration)/establishments/new/page";

describe("NewEstablishmentPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uses the owned organization when the url targets it explicitly", async () => {
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
      onboardingCompleted: true,
      canCreateEstablishment: true,
      subscription: { canManageBilling: true },
    });
    mocks.organization.getById.mockResolvedValue({
      id: "own-org",
      ownerId: "user-1",
      name: "My Studio",
      imageUrl: null,
    });

    const element = await NewEstablishmentPage({
      searchParams: Promise.resolve({ organizationId: "own-org" }),
    });

    expect(element).toMatchObject({
      props: expect.objectContaining({
        organizationId: "own-org",
      }),
    });
  });

  it("redirects to upgrade when the workspace cannot create more establishments", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "OWNER",
      organization: {
        id: "host-org",
        name: "Host Org",
        imageUrl: null,
        canRead: true,
        canUpdate: true,
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
      onboardingCompleted: true,
      canCreateEstablishment: false,
      subscription: { canManageBilling: true },
    });

    await expect(
      NewEstablishmentPage({
        searchParams: Promise.resolve({ organizationId: "host-org" }),
      }),
    ).rejects.toThrow("REDIRECT:/upgrade");
  });

  it("lets a new owner create the first establishment even if billing already denies more", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "OWNER",
      organization: {
        id: "host-org",
        name: "Host Org",
        imageUrl: null,
        canRead: true,
        canUpdate: true,
        canReadEstablishments: true,
        canCreateEstablishment: false,
      },
      establishments: [],
      onboardingCompleted: false,
      canCreateEstablishment: false,
      subscription: { canManageBilling: true },
    });

    const element = await NewEstablishmentPage({
      searchParams: Promise.resolve({ organizationId: "host-org" }),
    });

    expect(element).toMatchObject({
      props: expect.objectContaining({
        organizationId: "host-org",
      }),
    });
  });
});
