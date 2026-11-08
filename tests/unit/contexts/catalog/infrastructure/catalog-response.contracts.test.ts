import { describe, expect, it } from "vitest";
import { catalogServicePageResponseSchema, serviceCategoryPageResponseSchema } from "@/contexts/catalog/infrastructure/contracts/catalog-response.contracts";

const page = { page: 0, size: 20, totalElements: 0, totalPages: 0, content: [] };

describe("Catalog provider page contracts", () => {
  it("accepts an empty valid service page", () => {
    expect(catalogServicePageResponseSchema.parse(page).content).toEqual([]);
  });

  it("rejects malformed service pages instead of exposing untyped data", () => {
    expect(() => catalogServicePageResponseSchema.parse({ ...page, content: [{ id: "broken" }] })).toThrow();
  });

  it("rejects malformed category page envelopes", () => {
    expect(() => serviceCategoryPageResponseSchema.parse({ ...page, totalPages: "0" })).toThrow();
  });
});
