import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkforceRoleApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-role-api.gateway";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WorkforceRoleApiGateway", () => {
  it("should list roles from the backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([roleResource()]));
    vi.stubGlobal("fetch", fetchMock);

    const roles = await new WorkforceRoleApiGateway("access-token").list();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer access-token" },
      }),
    );
    expect(roles[0]?.getName()).toBe("Catalog manager");
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

  it("should update a role using PUT", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(roleResource()));
    vi.stubGlobal("fetch", fetchMock);

    const gateway = new WorkforceRoleApiGateway("access-token");
    await gateway.save({
      id: "11111111-1111-4111-8111-111111111111",
      getName: () => "Catalog manager",
      getPermissions: () => ["catalog:manage"],
      rename: vi.fn(),
      replacePermissions: vi.fn(),
    } as never);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/workforce/roles/11111111-1111-4111-8111-111111111111",
      expect.objectContaining({ method: "PUT" }),
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

  it("should load supported permissions", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([
      "business:access",
      "catalog:manage",
    ]));
    vi.stubGlobal("fetch", fetchMock);

    const permissions = await new WorkforceRoleApiGateway().permissions();

    expect(permissions).toEqual(["business:access", "catalog:manage"]);
  });
});

function roleResource() {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Catalog manager",
    permissions: ["catalog:manage", "business:access"],
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
