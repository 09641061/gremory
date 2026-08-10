import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteWorkforceRoleRoute,
  assignWorkforceRoleRoute,
  createWorkforceRoleRoute,
  listWorkforceRolePermissionsRoute,
  listWorkforceRolesRoute,
  patchWorkforceRoleRoute,
} from "@/contexts/workforce/interfaces/rest/routes/workforce-role.route";

const mocks = vi.hoisted(() => ({
  requireToken: vi.fn(),
  serviceFactory: vi.fn(),
  service: {
    list: vi.fn(),
    permissions: vi.fn(),
    create: vi.fn(),
    patch: vi.fn(),
    assign: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/contexts/workforce/infrastructure/session/team-session", () => ({
  requireTeamAccessToken: mocks.requireToken,
}));

vi.mock(
  "@/contexts/workforce/application/internal/commandservices/workforce-role-command.service",
  () => ({ createWorkforceRoleCommandService: mocks.serviceFactory }),
);

vi.mock(
  "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service",
  () => ({ createWorkforceRoleQueryService: mocks.serviceFactory }),
);

describe("workforce role routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireToken.mockResolvedValue("access-token");
    mocks.serviceFactory.mockReturnValue(mocks.service);
    mocks.service.list.mockResolvedValue([{
      id: "11111111-1111-4111-8111-111111111111",
      getName: () => "Catalog manager",
      getPermissions: () => ["catalog:manage"],
      isSystemRole: () => false,
      position: 1,
    }]);
    mocks.service.permissions.mockResolvedValue(["business:organizations:read"]);
    mocks.service.create.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      getName: () => "Catalog manager",
      getPermissions: () => ["catalog:manage"],
      isSystemRole: () => false,
      position: 1,
    });
    mocks.service.patch.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      getName: () => "Catalog manager",
      getPermissions: () => ["catalog:manage"],
      isSystemRole: () => false,
      position: 1,
    });
    mocks.service.assign.mockResolvedValue(undefined);
    mocks.service.delete.mockResolvedValue(undefined);
  });

  it("should list roles", async () => {
    const response = await listWorkforceRolesRoute();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Catalog manager",
        permissions: ["catalog:manage"],
        systemRole: false,
        position: 1,
      },
    ]);
  });

  it("should list supported permissions publicly", async () => {
    const response = await listWorkforceRolePermissionsRoute();

    expect(response.status).toBe(200);
    expect(await response.json()).toContain("business:organizations:read");
  });

  it("should create a role", async () => {
    const response = await createWorkforceRoleRoute(
      new Request("http://localhost/api/workforce/roles", {
        method: "POST",
        body: JSON.stringify({
          name: "Catalog manager",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.service.create).toHaveBeenCalledTimes(1);
  });

  it("should patch a role", async () => {
    const response = await patchWorkforceRoleRoute(
      new Request("http://localhost/api/workforce/roles/11111111-1111-4111-8111-111111111111", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Catalog manager",
        }),
      }),
      "11111111-1111-4111-8111-111111111111",
    );

    expect(response.status).toBe(200);
    expect(mocks.service.patch).toHaveBeenCalledTimes(1);
  });

  it("should assign a role to a member", async () => {
    const response = await assignWorkforceRoleRoute(
      new Request("http://localhost/api/workforce/roles/members/22222222-2222-4222-8222-222222222222", {
        method: "PUT",
        body: JSON.stringify({
          roleId: "11111111-1111-4111-8111-111111111111",
        }),
      }),
      "22222222-2222-4222-8222-222222222222",
    );

    expect(response.status).toBe(204);
    expect(mocks.service.assign).toHaveBeenCalledTimes(1);
  });

  it("should delete a role", async () => {
    const response = await deleteWorkforceRoleRoute("11111111-1111-4111-8111-111111111111");

    expect(response.status).toBe(204);
    expect(mocks.service.delete).toHaveBeenCalledWith({
      roleId: "11111111-1111-4111-8111-111111111111",
    });
  });
});
