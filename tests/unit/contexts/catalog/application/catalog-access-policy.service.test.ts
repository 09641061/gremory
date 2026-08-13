import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = {
  organizationService: {
    getMyOrganization: vi.fn(),
  },
  establishmentService: {
    getByOrganization: vi.fn(),
  },
  teamService: {
    getAccessContext: vi.fn(),
  },
};

vi.mock("server-only", () => ({}));

vi.mock("@/contexts/business/application/internal/queryservices/organization-query.service", () => ({
  createOrganizationQueryService: vi.fn(() => mocks.organizationService),
}));

vi.mock("@/contexts/business/application/internal/queryservices/establishment-query.service", () => ({
  createEstablishmentQueryService: vi.fn(() => mocks.establishmentService),
}));

vi.mock("@/contexts/workforce/application/internal/queryservices/team-query.service", () => ({
  createTeamQueryService: vi.fn(() => mocks.teamService),
}));

describe("CatalogAccessPolicyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.organizationService.getMyOrganization.mockReset();
    mocks.establishmentService.getByOrganization.mockReset();
    mocks.teamService.getAccessContext.mockReset();
  });

  it("should grant full catalog permissions to organization owners", async () => {
    mocks.organizationService.getMyOrganization.mockResolvedValue({ id: "org-1" });

    const { createCatalogAccessPolicyService } = await import(
      "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service"
    );
    const permissions = await createCatalogAccessPolicyService().getPermissions("est-1");

    expect(permissions).toEqual({
      canReadCatalog: true,
      canCreateCategory: true,
      canUpdateCategory: true,
      canDeleteCategory: true,
      canCreateService: true,
      canUpdateService: true,
      canDeleteService: true,
    });
    expect(mocks.teamService.getAccessContext).not.toHaveBeenCalled();
  });

  it("should allow catalog access when effective permissions include catalog reads", async () => {
    mocks.organizationService.getMyOrganization.mockRejectedValue(new Error("not owner"));
    mocks.teamService.getAccessContext.mockResolvedValue({
      active: true,
      establishments: [
        {
          establishmentId: "est-1",
          effectivePermissions: ["catalog:read"],
          roles: [{ name: "read" }],
        },
      ],
    });

    const { createCatalogAccessPolicyService } = await import(
      "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service"
    );
    const permissions = await createCatalogAccessPolicyService().getPermissions("est-1");

    expect(permissions.canReadCatalog).toBe(true);
    expect(permissions.canCreateCategory).toBe(false);
    expect(permissions.canCreateService).toBe(false);
  });

  it("should not grant catalog access from a role named read without effective permissions", async () => {
    mocks.organizationService.getMyOrganization.mockRejectedValue(new Error("not owner"));
    mocks.teamService.getAccessContext.mockResolvedValue({
      active: true,
      establishments: [
        {
          establishmentId: "est-1",
          effectivePermissions: [],
          roles: [{ name: "read" }],
        },
      ],
    });

    const { createCatalogAccessPolicyService } = await import(
      "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service"
    );
    const permissions = await createCatalogAccessPolicyService().getPermissions("est-1");

    expect(permissions.canReadCatalog).toBe(false);
  });

});
