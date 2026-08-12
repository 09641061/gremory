const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireToken: vi.fn(),
  establishmentFactory: vi.fn(),
  organizationFactory: vi.fn(),
  establishmentService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  organizationService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/contexts/business/infrastructure/session/business-session", () => ({
  requireBusinessAccessToken: mocks.requireToken,
}));
vi.mock(
  "@/contexts/business/application/internal/commandservices/establishment-command.service",
  () => ({
    createEstablishmentCommandService: mocks.establishmentFactory,
  }),
);
vi.mock(
  "@/contexts/business/application/internal/commandservices/organization-command.service",
  () => ({
    createOrganizationCommandService: mocks.organizationFactory,
  }),
);

import {
  createEstablishmentAction,
  deleteEstablishmentAction,
} from "@/contexts/business/interfaces/actions/establishment.actions";
import {
  createOrganizationAction,
  updateOrganizationAction,
} from "@/contexts/business/interfaces/actions/organization.actions";
import { createEstablishmentId } from "@/contexts/business/domain/model/valueobjects/establishment-id.vo";
import { createOrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";
import { initialBusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";

const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "22222222-2222-4222-8222-222222222222";

describe("Business server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireToken.mockResolvedValue("access-token");
    mocks.establishmentFactory.mockReturnValue(mocks.establishmentService);
    mocks.organizationFactory.mockReturnValue(mocks.organizationService);
    mocks.establishmentService.create.mockResolvedValue(
      createEstablishmentId(establishmentId),
    );
    mocks.establishmentService.delete.mockResolvedValue(undefined);
    mocks.organizationService.create.mockResolvedValue(
      createOrganizationId(organizationId),
    );
    mocks.organizationService.update.mockResolvedValue(
      createOrganizationId(organizationId),
    );
  });

  it("validates establishment input before invoking the application service", async () => {
    const result = await createEstablishmentAction(
      initialBusinessActionResult,
      form({ organizationId: "invalid", name: "" }),
    );

    expect(result.status).toBe("error");
    expect(mocks.establishmentFactory).not.toHaveBeenCalled();
  });

  it("creates an establishment with an authenticated command service", async () => {
    const result = await createEstablishmentAction(
      initialBusinessActionResult,
      form({
        organizationId,
        name: "  Main store  ",
        photoUrl: "https://example.com/store.png",
      }),
    );

    expect(mocks.requireToken).toHaveBeenCalledTimes(1);
    expect(mocks.establishmentFactory).toHaveBeenCalledWith();
    expect(mocks.establishmentService.create).toHaveBeenCalledWith({
      organizationId,
      name: "Main store",
      photoUrl: "https://example.com/store.png",
      timeZone: "America/Lima",
    });
    expect(result).toEqual({
      status: "success",
      data: { id: establishmentId },
      error: null,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/establishments");
  });

  it("deletes an establishment and revalidates its consumers", async () => {
    const result = await deleteEstablishmentAction(
      initialBusinessActionResult,
      form({ id: establishmentId }),
    );

    expect(mocks.establishmentService.delete).toHaveBeenCalledWith({
      id: establishmentId,
    });
    expect(result.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/catalog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/establishments");
  });

  it("updates organizations using explicit commands", async () => {
    const updated = await updateOrganizationAction(
      initialBusinessActionResult,
      form({ id: organizationId, name: "Acme Group" }),
    );

    expect(mocks.organizationService.update).toHaveBeenCalledWith({
      id: organizationId,
      name: "Acme Group",
      imageUrl: null,
    });
    expect(updated.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/organizations");
  });

  it("creates organizations and uploads a logo when a photo is provided", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: organizationId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ));

    const formData = new FormData();
    formData.set("name", "Acme Group");
    formData.set("photoFile", new File(["logo"], "logo.png", { type: "image/png" }));

    const result = await createOrganizationAction(initialBusinessActionResult, formData);

    expect(mocks.organizationService.create).toHaveBeenCalledWith({
      name: "Acme Group",
    });
    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:8080/api/business/organizations/${organizationId}`,
      expect.objectContaining({
        method: "PUT",
        headers: {
          Authorization: "Bearer access-token",
        },
      }),
    );
    expect(result.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/organizations");
  });

  it("returns a stable error when authentication fails", async () => {
    mocks.requireToken.mockRejectedValue(new Error("Authentication is required"));

    const result = await updateOrganizationAction(
      initialBusinessActionResult,
      form({ id: organizationId, name: "Acme Group" }),
    );

    expect(result).toEqual({
      status: "error",
      data: null,
      error: "Authentication is required",
    });
    expect(mocks.organizationService.update).not.toHaveBeenCalled();
  });
});

function form(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}
