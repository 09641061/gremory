import { describe, expect, it, vi } from "vitest";
import { WorkforceRoleCommandServiceImpl } from "@/contexts/workforce/application/internal/commandservices/workforce-role-command.service";
import { WorkforceRoleQueryServiceImpl } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";
import { WorkforceRole } from "@/contexts/workforce/domain/model/entities/workforce-role.entity";
import type { WorkforceRoleRepository } from "@/contexts/workforce/domain/services/workforce-role.repository";

describe("Workforce role application services", () => {
  it("should normalize role creation before saving", async () => {
    const repository = roleRepository();
    const save = vi.spyOn(repository, "save");
    const service = new WorkforceRoleCommandServiceImpl(repository);

    const role = await service.create({
      name: "  Admin  ",
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      id: null,
    }));
    expect(role.getName()).toBe("Admin");
    expect(role.getPermissions()).toEqual([]);
  });

  it("should patch a role using the provided identity", async () => {
    const repository = roleRepository();
    const patch = vi.spyOn(repository, "patch");
    const service = new WorkforceRoleCommandServiceImpl(repository);

    await service.patch({
      roleId: "11111111-1111-4111-8111-111111111111",
      name: "  Receptionist  ",
    });

    expect(patch).toHaveBeenCalledWith(expect.objectContaining({
      roleId: "11111111-1111-4111-8111-111111111111",
      name: "  Receptionist  ",
    }));
  });

  it("should return serializable roles and permissions from query service", async () => {
    const repository = roleRepository();
    const list = vi.spyOn(repository, "list");
    const permissions = vi.spyOn(repository, "permissions");
    const service = new WorkforceRoleQueryServiceImpl(repository);

    const roles = await service.list();
    const supportedPermissions = await service.permissions();

    expect(list).toHaveBeenCalledTimes(1);
    expect(permissions).toHaveBeenCalledTimes(1);
    expect(roles[0]?.getName()).toBe("Admin");
    expect(supportedPermissions).toContain("catalog:manage");
  });

  it("should delete a role through the repository", async () => {
    const repository = roleRepository();
    const remove = vi.spyOn(repository, "delete");
    const service = new WorkforceRoleCommandServiceImpl(repository);

    await service.delete({
      roleId: "11111111-1111-4111-8111-111111111111",
    });

    expect(remove).toHaveBeenCalledWith({
      roleId: "11111111-1111-4111-8111-111111111111",
    });
  });
});

function roleRepository(): WorkforceRoleRepository {
  return {
    list: vi.fn(async () => [
      WorkforceRole.rehydrate({
        id: "11111111-1111-4111-8111-111111111111",
        name: "Admin",
        permissions: ["catalog:manage", "business:organizations:read"],
        systemRole: false,
      }),
    ]),
    permissions: vi.fn(async () => [
      "business:organizations:read",
      "catalog:manage",
    ] as const),
    save: vi.fn(async (role: WorkforceRole) =>
      WorkforceRole.rehydrate({
        id: role.id ?? "11111111-1111-4111-8111-111111111111",
        name: role.getName(),
        permissions: role.getPermissions(),
        systemRole: false,
      })),
    patch: vi.fn(async (command) =>
      WorkforceRole.rehydrate({
        id: command.roleId,
        name: command.name ?? "Admin",
        permissions: command.permissions ?? ["catalog:manage", "business:organizations:read"],
        systemRole: false,
      })),
    delete: vi.fn(async () => undefined),
    assign: vi.fn(async () => undefined),
  };
}
