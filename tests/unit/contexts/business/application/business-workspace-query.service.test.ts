import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  organization: {
    getMyOrganization: vi.fn(),
    getById: vi.fn(),
  },
  establishment: {
    getByOrganization: vi.fn(),
  },
  team: {
    getAccessContext: vi.fn(),
  },
}));

vi.mock(
  "@/contexts/business/application/internal/queryservices/organization-query.service",
  () => ({
    createOrganizationQueryService: () => mocks.organization,
  }),
);

vi.mock(
  "@/contexts/business/application/internal/queryservices/establishment-query.service",
  () => ({
    createEstablishmentQueryService: () => mocks.establishment,
  }),
);

vi.mock(
  "@/contexts/workforce/application/internal/queryservices/team-query.service",
  () => ({
    createTeamQueryService: () => mocks.team,
  }),
);

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

describe("business workspace query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the invited organization instead of a create form when the user has workforce access", async () => {
    mocks.organization.getMyOrganization.mockRejectedValue(new Error("no owner org"));
    mocks.team.getAccessContext.mockResolvedValue({
      active: true,
      establishments: [
        {
          organizationId: "org-2",
          organizationName: "Partner Org",
          establishmentId: "est-2",
          establishmentName: "Main branch",
          roles: [{ name: "read" }],
          effectivePermissions: ["business:organizations:read"],
        },
      ],
    });
    mocks.organization.getById.mockResolvedValue({
      id: "org-2",
      ownerId: "owner-2",
      name: "Partner Org",
      imageUrl: null,
    });

    const result = await createBusinessWorkspaceQueryService().getOrganizationPageState();

    expect(result).toEqual({
      status: "ready",
      organization: {
        id: "org-2",
        ownerId: "owner-2",
        name: "Partner Org",
        imageUrl: null,
      },
      canUpdate: false,
    });
  });

  it("returns create state only when no organization or workforce access exists", async () => {
    mocks.organization.getMyOrganization.mockRejectedValue(new Error("no owner org"));
    mocks.team.getAccessContext.mockRejectedValue(new Error("no workforce access"));

    const result = await createBusinessWorkspaceQueryService().getOrganizationPageState();

    expect(result).toEqual({ status: "create" });
  });
});
