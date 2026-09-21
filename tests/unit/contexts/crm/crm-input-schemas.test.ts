import { describe, expect, it } from "vitest";
import { deleteCustomerInputSchema, resolveDocumentInputSchema } from "@/contexts/crm/interfaces/schemas/action-input.schema";

describe("CRM action input schemas", () => {
  it("rejects blank identifiers", () => {
    expect(deleteCustomerInputSchema.safeParse({ id: "", establishmentId: "est-1" }).success).toBe(false);
    expect(resolveDocumentInputSchema.safeParse({ type: "dni", number: "", establishmentId: "est-1" }).success).toBe(false);
  });

  it("accepts only the stable document types", () => {
    expect(resolveDocumentInputSchema.safeParse({ type: "dni", number: "12345678", establishmentId: "est-1" }).success).toBe(true);
    expect(resolveDocumentInputSchema.safeParse({ type: "tax", number: "123", establishmentId: "est-1" }).success).toBe(false);
  });
});
