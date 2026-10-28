import { describe, expect, it } from "vitest";
import {
  customerSchema,
  customerPageResponseSchema,
  customerOverviewResponseSchema,
} from "@/contexts/crm/infrastructure/contracts/crm.schemas";

describe("CRM Schemas", () => {
  const baseCustomer = {
    id: "cust-wa-1",
    organizationId: "org-1",
    establishmentId: "est-1",
    documentType: "DNI" as const,
    documentNumber: "72345678",
    name: "Juan Perez",
    phoneCountryCode: "+51",
    phoneNumber: "987654321",
    phone: "+51987654321",
  };

  it("parses a WhatsApp-registered customer with email: null without throwing", () => {
    const raw = {
      ...baseCustomer,
      email: null,
      notes: null,
    };

    const parsed = customerSchema.parse(raw);
    expect(parsed.email).toBeNull();
    expect(parsed.name).toBe("Juan Perez");
  });

  it("parses a customer with email: undefined (omitted) without throwing", () => {
    const raw = {
      ...baseCustomer,
    };

    const parsed = customerSchema.parse(raw);
    expect(parsed.email).toBeUndefined();
  });

  it("parses a customer with email: empty string without throwing", () => {
    const raw = {
      ...baseCustomer,
      email: "",
    };

    const parsed = customerSchema.parse(raw);
    expect(parsed.email).toBe("");
  });

  it("parses a customer with a valid email address", () => {
    const raw = {
      ...baseCustomer,
      email: "juan.perez@example.com",
    };

    const parsed = customerSchema.parse(raw);
    expect(parsed.email).toBe("juan.perez@example.com");
  });

  it("rejects a customer with an invalid email address format", () => {
    const raw = {
      ...baseCustomer,
      email: "not-an-email",
    };

    expect(() => customerSchema.parse(raw)).toThrow();
  });

  it("parses customerPageResponseSchema containing customers with email: null", () => {
    const pageResponse = {
      content: [
        {
          ...baseCustomer,
          id: "cust-wa-1",
          email: null,
        },
        {
          ...baseCustomer,
          id: "cust-reg-2",
          email: "maria@example.com",
        },
      ],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
    };

    const parsed = customerPageResponseSchema.parse(pageResponse);
    expect(parsed.content).toHaveLength(2);
    expect(parsed.content[0].email).toBeNull();
    expect(parsed.content[1].email).toBe("maria@example.com");
  });

  it("parses customerOverviewResponseSchema when customer has email: null", () => {
    const overviewResponse = {
      customer: {
        ...baseCustomer,
        email: null,
      },
      appointments: {
        totalAppointments: 1,
        completedAppointments: 1,
        noShowCount: 0,
        lastOrNextVisitAt: "2026-10-27T10:00:00Z",
        recentAppointments: [
          {
            id: "app-1",
            serviceName: "Corte de cabello",
            employeeName: "Ana",
            startsAt: "2026-10-27T10:00:00Z",
            endsAt: "2026-10-27T10:45:00Z",
            status: "COMPLETED",
          },
        ],
      },
      whatsappConversationId: "conv-123",
    };

    const parsed = customerOverviewResponseSchema.parse(overviewResponse);
    expect(parsed.customer.email).toBeNull();
    expect(parsed.whatsappConversationId).toBe("conv-123");
  });
});
