import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWorkspace: vi.fn(),
}));

vi.mock(
  "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway",
  () => ({
    BusinessWorkspaceApiGateway: class {
      getWorkspace = mocks.getWorkspace;
    },
  }),
);

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

const ownerOrganizationId = "11111111-1111-4111-8111-111111111111";
const memberOrganizationId = "22222222-2222-4222-8222-222222222222";
const memberEstablishmentId = "44444444-4444-4444-8444-444444444444";

describe("business workspace query service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the owner and invited organizations in the same workspace", async () => {
    mocks.getWorkspace.mockResolvedValue({
      activeOrganizationId: memberOrganizationId,
      activeEstablishmentId: memberEstablishmentId,
      organizations: [
        {
          id: ownerOrganizationId,
          name: "Personal Org",
          imageUrl: null,
          mode: "OWNER",
          establishments: [],
          permissions: { canRead: true, canUpdate: true, canCreateEstablishment: true },
        },
        {
          id: memberOrganizationId,
          name: "Partner Org",
          imageUrl: null,
          mode: "MEMBER",
          establishments: [{
            id: memberEstablishmentId,
            name: "Main branch",
            photoUrl: null,
            permissions: { canRead: true, canUpdate: false, canDelete: false },
          }],
          permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
        },
      ],
    });

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.organization?.id).toBe(memberOrganizationId);
    expect(result.organizations.map((organization) => organization.id)).toEqual([
      ownerOrganizationId,
      memberOrganizationId,
    ]);
    expect(result.establishments).toEqual([{
      id: memberEstablishmentId,
      name: "Main branch",
      photoUrl: null,
      canRead: true,
      canUpdate: false,
      canDelete: false,
    }]);
  });

  it("returns create state only when the backend reports no organizations", async () => {
    mocks.getWorkspace.mockResolvedValue({
      activeOrganizationId: null,
      activeEstablishmentId: null,
      organizations: [],
    });

    const result = await createBusinessWorkspaceQueryService().getOrganizationPageState();

    expect(result).toEqual({ status: "create" });
  });
});
