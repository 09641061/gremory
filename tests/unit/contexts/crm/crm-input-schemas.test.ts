import { describe, expect, it } from "vitest";
import { deleteCustomerInputSchema, updateCustomerNotesInputSchema } from "@/contexts/crm/interfaces/schemas/action-input.schema";

describe("CRM action input schemas", () => {
  it("rejects blank identifiers", () => {
    expect(deleteCustomerInputSchema.safeParse({ id: "", establishmentId: "est-1" }).success).toBe(false);
    expect(deleteCustomerInputSchema.safeParse({ id: "cust-1", establishmentId: "" }).success).toBe(false);
  });

  it("validates updateCustomerNotesInputSchema correctly", () => {
    expect(updateCustomerNotesInputSchema.safeParse({
      customerId: "cust-1",
      establishmentId: "est-1",
      notes: "Cliente prefiere corte con tijera",
    }).success).toBe(true);

    expect(updateCustomerNotesInputSchema.safeParse({
      customerId: "",
      establishmentId: "est-1",
      notes: "Notes",
    }).success).toBe(false);

    expect(updateCustomerNotesInputSchema.safeParse({
      customerId: "cust-1",
      establishmentId: "est-1",
      notes: "a".repeat(1001),
    }).success).toBe(false);
  });
});
