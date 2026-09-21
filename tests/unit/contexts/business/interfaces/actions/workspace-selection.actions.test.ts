import { describe, expect, it, vi } from "vitest";

const cookieStore = {
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { setWorkspaceSelectionAction } from "@/contexts/business/interfaces/actions/workspace-selection.actions";

describe("workspace selection action", () => {
  it("writes selection only through the server cookie store", async () => {
    await setWorkspaceSelectionAction({
      organizationId: "org-1",
      establishmentId: "est-1",
      previewOrganizationId: "org-1",
    });

    expect(cookieStore.set).toHaveBeenCalledWith(
      "takodu.active_organization_id",
      "org-1",
      expect.objectContaining({ httpOnly: true, path: "/" }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "takodu.active_establishment_id",
      "est-1",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("clears an absent establishment instead of persisting stale context", async () => {
    await setWorkspaceSelectionAction({ organizationId: "org-1" });

    expect(cookieStore.delete).toHaveBeenCalledWith("takodu.active_establishment_id");
    expect(cookieStore.delete).toHaveBeenCalledWith("takodu.preview_organization_id");
  });
});
