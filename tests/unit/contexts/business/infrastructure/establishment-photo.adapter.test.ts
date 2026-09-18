import { EstablishmentPhotoAdapter } from "@/contexts/business/infrastructure/adapters/establishment-photo.adapter";
import { createOrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";

const mocks = vi.hoisted(() => ({ requireToken: vi.fn() }));

vi.mock("@/contexts/business/infrastructure/session/business-session", () => ({
  requireBusinessAccessToken: mocks.requireToken,
}));

describe("EstablishmentPhotoAdapter", () => {
  it("returns the API detail when uploading a photo fails", async () => {
    mocks.requireToken.mockResolvedValue("access-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Photo is too large" }), { status: 413 }),
      ),
    );

    await expect(
      new EstablishmentPhotoAdapter().upload(
        new File(["photo"], "photo.png", { type: "image/png" }),
        createOrganizationId("11111111-1111-4111-8111-111111111111"),
      ),
    ).rejects.toThrow("Photo is too large");
  });

  it("sends the organization tenant when uploading a photo", async () => {
    mocks.requireToken.mockResolvedValue("access-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ storedPath: "/images/business/establishments/photo.png" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const organizationId = createOrganizationId("11111111-1111-4111-8111-111111111111");
    await new EstablishmentPhotoAdapter().upload(
      new File(["photo"], "photo.png", { type: "image/png" }),
      organizationId,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/business/establishments/images",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer access-token",
          "X-Organization-Id": organizationId.value,
        },
        body: expect.any(FormData),
      }),
    );
  });
});
