import { describe, expect, it, vi } from "vitest";
import { CatalogServiceApiGateway } from "@/contexts/catalog/infrastructure/gateways/catalog-service-api.gateway";
import { ServiceCategoryApiGateway } from "@/contexts/catalog/infrastructure/gateways/service-category-api.gateway";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

const category = { id: "cat-1", establishmentId: "est-1", name: "Hair" };
const service = {
  id: "service-1", establishmentId: "est-1", name: "Cut", description: "Basic cut",
  price: 25, durationMinutes: 30, categoryId: null, preServiceInstructions: null,
  postServiceRecommendations: null, preparationMinutes: 0, cleanupMinutes: 0, status: "ACTIVE" as const,
};
function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/problem+json" } });
}

describe("Catalog gateway contract", () => {
  it("maps the documented category resource including its identifier", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(category)));
    const result = await new ServiceCategoryApiGateway().create({ establishmentId: "est-1", name: "Hair" }, "token");
    expect(result.props.id.value).toBe("cat-1");
    expect(result.props.name).toBe("Hair");
  });

  it.each([
    [403, "Catalog access denied"],
    [409, "Category already exists"],
    [404, "Category not found"],
  ])("preserves RFC 7807 status %s and detail", async (status, detail) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ type: "about:blank", title: "Catalog error", status, detail }, status)));
    const promise = status === 403
      ? new CatalogServiceApiGateway().create({ establishmentId: "est-1", name: "Cut", description: "Basic cut", price: 25, durationMinutes: 30 }, "token")
      : new ServiceCategoryApiGateway().update({ id: "cat-1", name: "Other" }, "token");
    await expect(promise).rejects.toMatchObject({ status, message: detail });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
  });

  it("accepts the nullable fields in the documented service response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(service)));
    const result = await new CatalogServiceApiGateway().getById("service-1", "est-1", "token");
    expect(result.props.categoryId).toBeNull();
    expect(result.props.preServiceInstructions).toBeNull();
  });
});
