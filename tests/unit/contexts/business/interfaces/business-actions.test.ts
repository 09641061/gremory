const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  cookies: vi.fn(),
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
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));
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
    const deleteCookie = vi.fn();
    mocks.cookies.mockResolvedValue({ delete: deleteCookie });
    mocks.requireToken.mockResolvedValue("access-token");
    mocks.establishmentFactory.mockReturnValue(mocks.establishmentService);
    mocks.organizationFactory.mockReturnValue(mocks.organizationService);
    mocks.organizationService.create.mockResolvedValue(
      createOrganizationId(organizationId),
    );
    mocks.establishmentService.create.mockResolvedValue(
      createEstablishmentId(establishmentId),
    );
    mocks.establishmentService.delete.mockResolvedValue(undefined);
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
    await expect(createEstablishmentAction(
      initialBusinessActionResult,
      form({
        organizationId,
        name: "  Main store  ",
        photoUrl: "https://picsum.photos/seed/replik-test/800/600",
      }),
    )).rejects.toThrow(`REDIRECT:/welcome?establishmentId=${establishmentId}`);

    expect(mocks.requireToken).toHaveBeenCalledTimes(1);
    expect(mocks.establishmentFactory).toHaveBeenCalledWith();
    expect(mocks.establishmentService.create).toHaveBeenCalledWith({
      organizationId,
      name: "Main store",
      photoUrl: "https://picsum.photos/seed/replik-test/800/600",
      timeZone: "America/Lima",
      photoFile: null,
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
      imageFile: null,
    });
    expect(updated.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/organization");
  });

  it("clears the persisted establishment selection after creating a new organization", async () => {
    const deleteCookie = vi.fn();
    mocks.cookies.mockResolvedValue({ delete: deleteCookie });

    await expect(createOrganizationAction(
      initialBusinessActionResult,
      form({ name: "Acme Group" }),
    )).rejects.toThrow("REDIRECT:/establishments/new?organizationId=11111111-1111-4111-8111-111111111111");

    expect(mocks.organizationService.create).toHaveBeenCalledWith({
      name: "Acme Group",
      imageFile: null,
    });
    expect(deleteCookie).toHaveBeenCalledWith("takodu.active_establishment_id");
  });

  it("rejects an invalid organization id before reaching the application service", async () => {
    const result = await updateOrganizationAction(
      initialBusinessActionResult,
      form({ id: "not-a-uuid", name: "Acme Group" }),
    );

    expect(result.status).toBe("error");
    expect(mocks.organizationFactory).not.toHaveBeenCalled();
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
