import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  getHeaderViewModel: vi.fn(),
  establishmentsPage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => ({
    getHeaderViewModel: mocks.getHeaderViewModel,
  }),
}));

vi.mock("@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page", () => ({
  EstablishmentsPage: (props: unknown) => {
    mocks.establishmentsPage(props);
    return null;
  },
}));

import EstablishmentsRoutePage from "@/app/(protected)/(configuration)/establishments/page";

describe("EstablishmentsRoutePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uses the establishment already present in the workspace instead of fetching it again", async () => {
    mocks.getHeaderViewModel.mockResolvedValue({
      organization: {
        id: "org-1",
        name: "Takodu Studio",
        imageUrl: null,
        canRead: true,
        canUpdate: true,
        canReadEstablishments: true,
        canCreateEstablishment: true,
      },
      canReadEstablishments: true,
      canCreateEstablishment: true,
      accountType: "MEMBER",
      activeEstablishmentId: "est-1",
      establishments: [
        {
          id: "est-1",
          name: "Miraflores",
          photoUrl: "https://cdn.test/miraflores.png",
          timeZone: "America/Lima",
          canRead: true,
          canUpdate: false,
          canDelete: false,
        },
      ],
    });

    const element = await EstablishmentsRoutePage({
      searchParams: Promise.resolve({ establishmentId: "est-1" }),
    });

    expect(element).toMatchObject({
      props: expect.objectContaining({
        selectedEstablishment: {
          id: "est-1",
          name: "Miraflores",
          photoUrl: "https://cdn.test/miraflores.png",
          timeZone: "America/Lima",
        },
      }),
    });

    expect(mocks.getHeaderViewModel).toHaveBeenCalledWith({
      establishmentId: "est-1",
    });
    expect(mocks.establishmentsPage).not.toHaveBeenCalled();
  });

  it("passes the owner's establishment update permission to the editor", async () => {
    mocks.getHeaderViewModel.mockResolvedValue({
      organization: {
        id: "org-1",
        name: "Takodu Studio",
        imageUrl: null,
        canRead: true,
        canUpdate: true,
        canReadEstablishments: true,
        canCreateEstablishment: true,
      },
      canReadEstablishments: true,
      canCreateEstablishment: true,
      accountType: "OWNER",
      activeEstablishmentId: "est-1",
      establishments: [
        {
          id: "est-1",
          name: "Miraflores",
          photoUrl: null,
          timeZone: "America/Lima",
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
      ],
    });

    const element = await EstablishmentsRoutePage({
      searchParams: Promise.resolve({ establishmentId: "est-1" }),
    });

    expect(element).toMatchObject({
      props: expect.objectContaining({ canUpdateMap: { "est-1": true } }),
    });
  });
});
