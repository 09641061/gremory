import { describe, expect, it, vi } from "vitest";
import { EstablishmentApiGateway } from "@/contexts/business/infrastructure/gateways/establishment-api.gateway";
import { OrganizationApiGateway } from "@/contexts/business/infrastructure/gateways/organization-api.gateway";
import { createEstablishmentId } from "@/contexts/business/domain/model/valueobjects/establishment-id.vo";
import { createOrganizationId } from "@/contexts/business/domain/model/valueobjects/organization-id.vo";
import { BusinessApiError } from "@/contexts/business/infrastructure/http/business-api.client";

const tokenMock = vi.hoisted(() => vi.fn());
vi.mock("@/contexts/business/infrastructure/session/business-session", () => ({ requireBusinessAccessToken: tokenMock }));
const organizationId = "11111111-1111-4111-8111-111111111111";
const establishmentId = "22222222-2222-4222-8222-222222222222";
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("Business gateway contract", () => {
  it("maps the real backend establishment response without scheduling metadata", async () => {
    tokenMock.mockResolvedValue("token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({
      id: establishmentId,
      organizationId,
      name: "Main",
      photoUrl: null,
      timeZone: null,
    })));
    const result = await new EstablishmentApiGateway().findById(createEstablishmentId(establishmentId));
    expect(result).not.toBeNull();
    expect(result?.timeZone).toBe("UTC");
    expect(result?.ownerAvailableForScheduling).toBe(true);
    expect(result?.photoUrl.value).toBeNull();
  });

  it("maps the documented nullable organization image", async () => {
    tokenMock.mockResolvedValue("token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ id: organizationId, ownerId: "owner-1", name: "Org", imageUrl: null })));
    const result = await new OrganizationApiGateway().findById(createOrganizationId(organizationId));
    expect(result?.imageUrl.value).toBeNull();
  });

  it("keeps forbidden RFC 7807 responses as typed business errors", async () => {
    tokenMock.mockResolvedValue("token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ type: "about:blank", title: "Forbidden", status: 403, detail: "Insufficient permissions" }, 403)));
    const error = await new EstablishmentApiGateway().delete(createEstablishmentId(establishmentId), createOrganizationId(organizationId)).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BusinessApiError);
    expect(error).toMatchObject({ status: 403, message: "Insufficient permissions" });
  });
});
