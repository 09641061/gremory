import { OrganizationImageUploadAdapter } from "@/contexts/business/infrastructure/adapters/organization-image-upload.adapter";
import { createOrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";
import { createOrganizationName } from "@/contexts/business/domain/model/valueobjects/organization-name.vo";

const mocks = vi.hoisted(() => ({ requireToken: vi.fn() }));

vi.mock("@/contexts/business/infrastructure/session/business-session", () => ({
  requireBusinessAccessToken: mocks.requireToken,
}));

describe("OrganizationImageUploadAdapter", () => {
  it("returns the API detail when uploading a logo fails", async () => {
    mocks.requireToken.mockResolvedValue("access-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Logo is too large" }), { status: 413 }),
      ),
    );

    await expect(
      new OrganizationImageUploadAdapter().upload(
        createOrganizationId("11111111-1111-4111-8111-111111111111"),
        createOrganizationName("Takodu"),
        new File(["logo"], "logo.png", { type: "image/png" }),
      ),
    ).rejects.toThrow("Logo is too large");
  });

  it("sends the organization tenant when uploading a logo", async () => {
    mocks.requireToken.mockResolvedValue("access-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "11111111-1111-4111-8111-111111111111" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const organizationId = createOrganizationId("11111111-1111-4111-8111-111111111111");
    await new OrganizationImageUploadAdapter().upload(
      organizationId,
      createOrganizationName("Takodu"),
      new File(["logo"], "logo.png", { type: "image/png" }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/business/organizations/11111111-1111-4111-8111-111111111111",
      expect.objectContaining({
        method: "PUT",
        headers: {
          Authorization: "Bearer access-token",
          "X-Organization-Id": organizationId.value,
        },
        body: expect.any(FormData),
      }),
    );
  });
});
