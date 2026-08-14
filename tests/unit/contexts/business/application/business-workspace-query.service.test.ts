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
      capabilities: {
        canReadAnalytics: true,
      },
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
      timeZone: null,
      canRead: true,
      canUpdate: false,
      canDelete: false,
    }]);
    expect(result.capabilities).toEqual({
      canReadAppointments: undefined,
      canReadCatalog: undefined,
      canReadCustomers: undefined,
      canReadTeam: undefined,
      canReadAnalytics: true,
    });
  });

  it("keeps the owner creation entry point visible when Billing reports a plan limit", async () => {
    mocks.getWorkspace.mockResolvedValue({
      activeOrganizationId: ownerOrganizationId,
      activeEstablishmentId: null,
      organizations: [{
        id: ownerOrganizationId,
        name: "Personal Org",
        imageUrl: null,
        mode: "OWNER",
        establishments: [{
          id: memberEstablishmentId,
          name: "Existing location",
          photoUrl: null,
          permissions: { canRead: true, canUpdate: true, canDelete: true },
        }],
        permissions: { canRead: true, canUpdate: true, canCreateEstablishment: false },
      }],
    });

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.canCreateEstablishment).toBe(true);
    expect(result.organization?.canCreateEstablishment).toBe(true);
  });

  it("hides the establishment creation entry point for a member without permission", async () => {
    mocks.getWorkspace.mockResolvedValue({
      activeOrganizationId: memberOrganizationId,
      activeEstablishmentId: memberEstablishmentId,
      organizations: [{
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
      }],
    });

    const result = await createBusinessWorkspaceQueryService().getHeaderViewModel();

    expect(result.canCreateEstablishment).toBe(false);
    expect(result.canReadEstablishments).toBe(true);
    expect(result.canCreateOrganization).toBe(true);
  });

  it("hides the organization creation entry point once the user owns one", async () => {
    mocks.getWorkspace.mockResolvedValue({
      activeOrganizationId: ownerOrganizationId,
      activeEstablishmentId: null,
      organizations: [{
        id: ownerOrganizationId,
        name: "Personal Org",
        imageUrl: null,
        mode: "OWNER",
        establishments: [],
        permissions: { canRead: true, canUpdate: true, canCreateEstablishment: true },
      }],
    });

    const service = createBusinessWorkspaceQueryService();

    expect((await service.getHeaderViewModel()).canCreateOrganization).toBe(false);
    expect(await service.getOrganizationCreationState()).toEqual({ status: "denied" });
  });

  it("allows organization creation for a member that does not own one yet", async () => {
    mocks.getWorkspace.mockResolvedValue({
      activeOrganizationId: memberOrganizationId,
      activeEstablishmentId: null,
      organizations: [{
        id: memberOrganizationId,
        name: "Partner Org",
        imageUrl: null,
        mode: "MEMBER",
        establishments: [],
        permissions: { canRead: true, canUpdate: false, canCreateEstablishment: false },
      }],
    });

    const result = await createBusinessWorkspaceQueryService().getOrganizationCreationState();

    expect(result).toEqual({ status: "allowed" });
  });

  it("keeps the organization creation route reachable when the workspace read is forbidden", async () => {
    mocks.getWorkspace.mockRejectedValue({ status: 403 });

    const result = await createBusinessWorkspaceQueryService().getOrganizationCreationState();

    expect(result).toEqual({ status: "allowed" });
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

  it("keeps the organization form available when backend creation access is denied", async () => {
    mocks.getWorkspace.mockRejectedValue({ status: 403 });

    const result = await createBusinessWorkspaceQueryService().getOrganizationPageState();

    expect(result).toEqual({ status: "create" });
  });

  it("denies the organizations page for an active organization without read permission", async () => {
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
          name: "Restricted Org",
          imageUrl: null,
          mode: "MEMBER",
          establishments: [],
          permissions: { canRead: false, canUpdate: false, canCreateEstablishment: false },
        },
      ],
    });

    const result = await createBusinessWorkspaceQueryService().getOrganizationPageState();

    expect(result).toEqual({ status: "denied" });
  });
});
