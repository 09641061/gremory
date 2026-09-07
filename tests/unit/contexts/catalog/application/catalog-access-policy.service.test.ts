import { beforeEach, describe, expect, it } from "vitest";

vi.mock("server-only", () => ({}));

import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";

describe("CatalogAccessPolicyService", () => {
  beforeEach(() => {
    // no external dependencies; service derives permissions from the supplied scope only.
  });

  it("grants catalog read access whenever an establishment is selected", async () => {
    const permissions = await createCatalogAccessPolicyService().getPermissions("est-1");
    expect(permissions.canReadCatalog).toBe(true);
    expect(permissions.canCreateCategory).toBe(false);
    expect(permissions.canUpdateCategory).toBe(false);
    expect(permissions.canDeleteCategory).toBe(false);
    expect(permissions.canCreateService).toBe(false);
    expect(permissions.canUpdateService).toBe(false);
    expect(permissions.canDeleteService).toBe(false);
  });

  it("denies catalog access when no establishment is selected", async () => {
    const permissions = await createCatalogAccessPolicyService().getPermissions(undefined);
    expect(permissions.canReadCatalog).toBe(false);
  });
});
