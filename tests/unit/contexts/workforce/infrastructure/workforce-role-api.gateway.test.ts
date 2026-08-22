import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkforceRoleApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-role-api.gateway";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WorkforceRoleApiGateway", () => {
  it("should list roles from the backend using page params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(pageResource()));
    vi.stubGlobal("fetch", fetchMock);

    const roles = await new WorkforceRoleApiGateway("access-token").list();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles?page=0&size=20",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer access-token" },
      }),
    );
    expect(roles[0]?.getName()).toBe("Catalog manager");
  });

  it("should forward the tenant when listing roles for an organization", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(pageResource()));
    vi.stubGlobal("fetch", fetchMock);

    await new WorkforceRoleApiGateway("access-token", "44444444-4444-4444-8444-444444444444").list();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles?page=0&size=20",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer access-token",
          "X-Organization-Id": "44444444-4444-4444-8444-444444444444",
        },
      }),
    );
  });

  it("should create a role using POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(roleResource()));
    vi.stubGlobal("fetch", fetchMock);

    const gateway = new WorkforceRoleApiGateway("access-token");
    const role = await gateway.save({
      id: null,
      getName: () => "Catalog manager",
      getPermissions: () => ["catalog:manage"],
      rename: vi.fn(),
      replacePermissions: vi.fn(),
    } as never);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles",
      expect.objectContaining({ method: "POST" }),
    );
    expect(role.id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("should patch a role using PATCH", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(roleResource()));
    vi.stubGlobal("fetch", fetchMock);

    const gateway = new WorkforceRoleApiGateway("access-token");
    await gateway.patch({
      roleId: "11111111-1111-4111-8111-111111111111",
      name: "Catalog manager",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles/11111111-1111-4111-8111-111111111111",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("should assign a role to a member", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await new WorkforceRoleApiGateway("access-token").assign({
      memberId: "22222222-2222-4222-8222-222222222222",
      roleId: "11111111-1111-4111-8111-111111111111",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles/members/22222222-2222-4222-8222-222222222222",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("should delete a role using DELETE", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await new WorkforceRoleApiGateway("access-token").delete({
      roleId: "11111111-1111-4111-8111-111111111111",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles/11111111-1111-4111-8111-111111111111",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("should load the assignable permissions from the backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([
      "scheduling:read",
      "scheduling:manage",
      "catalog:read",
      "catalog:manage",
      "crm:read",
      "crm:manage",
      "workforce:read",
      "workforce:manage",
      "analytics:read",
      "establishment:update",
    ]));
    vi.stubGlobal("fetch", fetchMock);

    const permissions = await new WorkforceRoleApiGateway("access-token").permissions();

    expect(permissions).toEqual([
      "scheduling:read",
      "scheduling:manage",
      "catalog:read",
      "catalog:manage",
      "crm:read",
      "crm:manage",
      "workforce:read",
      "workforce:manage",
      "analytics:read",
      "establishment:update",
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles/permissions",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer access-token" },
      }),
    );
  });

  it("should reject non-assignable permissions from the catalog", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(["establishment:read", "workforce:invite"])),
    );

    await expect(new WorkforceRoleApiGateway("access-token").permissions()).rejects.toThrow();
  });
});

function roleResource() {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Catalog manager",
      permissions: ["catalog:manage", "establishment:read", "analytics:read"],
    systemRole: false,
    position: 1,
  };
}

function pageResource() {
  return {
    content: [roleResource()],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
