import { describe, expect, it } from "vitest";
import { deleteCustomerInputSchema, resolveDocumentInputSchema } from "@/contexts/crm/interfaces/schemas/action-input.schema";
import { resolvedIdentitySchema } from "@/contexts/crm/infrastructure/contracts/crm.schemas";

describe("CRM action input schemas", () => {
  it("rejects blank identifiers", () => {
    expect(deleteCustomerInputSchema.safeParse({ id: "", establishmentId: "est-1" }).success).toBe(false);
    expect(resolveDocumentInputSchema.safeParse({ type: "dni", number: "", establishmentId: "est-1" }).success).toBe(false);
  });

  it("accepts DNI resolution without SUNAT metadata", () => {
    const result = resolvedIdentitySchema.safeParse({
      documentNumber: "07760394",
      name: "Maria Gonzalez",
      taxpayerStatus: null,
      taxpayerCondition: null,
    });

    expect(result.success).toBe(true);
  });

  it("accepts only the stable document types", () => {
    expect(resolveDocumentInputSchema.safeParse({ type: "dni", number: "12345678", establishmentId: "est-1" }).success).toBe(true);
    expect(resolveDocumentInputSchema.safeParse({ type: "tax", number: "123", establishmentId: "est-1" }).success).toBe(false);
  });
});
