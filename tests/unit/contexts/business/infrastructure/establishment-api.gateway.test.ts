import { EstablishmentApiGateway } from "@/contexts/business/infrastructure/gateways/establishment-api.gateway";
import { createEstablishmentId } from "@/contexts/business/domain/model/valueobjects/establishment-id.vo";
import { createOrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";

const mocks = vi.hoisted(() => ({ requireToken: vi.fn() }));

vi.mock("@/contexts/business/infrastructure/session/business-session", () => ({
  requireBusinessAccessToken: mocks.requireToken,
}));

describe("EstablishmentApiGateway", () => {
  it("sends the organization tenant header when deleting an establishment", async () => {
    mocks.requireToken.mockResolvedValue("access-token");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const establishmentId = createEstablishmentId("22222222-2222-4222-8222-222222222222");
    const organizationId = createOrganizationId("11111111-1111-4111-8111-111111111111");

    await new EstablishmentApiGateway().delete(establishmentId, organizationId);

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:8080/api/business/establishments/${establishmentId.value}`,
      expect.objectContaining({
        method: "DELETE",
        headers: {
          Authorization: "Bearer access-token",
          "X-Organization-Id": organizationId.value,
        },
      }),
    );
  });
});
