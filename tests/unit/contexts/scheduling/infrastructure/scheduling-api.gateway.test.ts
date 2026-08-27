import { describe, expect, it, vi } from "vitest";
import { SchedulingApiError, SchedulingApiGateway } from "@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway";
import { appointmentResponseSchema } from "@/contexts/scheduling/interfaces/rest/schemas/appointment.schemas";

const appointment = {
  id: "a-1", title: "Cut", startsAt: "2026-01-01T10:00:00Z", endsAt: "2026-01-01T10:30:00Z",
  serviceId: null, customerId: null, employeeId: null, establishmentId: null, status: "CONFIRMED",
  createdBy: null, cancelledBy: null, deletedBy: null, cancellationReason: null, cancelledAt: null, deletedAt: null,
  createdAt: "2026-01-01T09:00:00Z", updatedAt: "2026-01-01T09:00:00Z",
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("Scheduling gateway contract", () => {
  it("accepts the appointment response with nullable relationships", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(appointment)));
    const result = await new SchedulingApiGateway().getAppointment("a-1", "token");
    expect(appointmentResponseSchema.parse(appointment)).toEqual(appointment);
    expect(result).toMatchObject({ id: "a-1", serviceId: null, customerId: null, employeeId: null });
  });

  it("validates appointment pages returned by search", async () => {
    const page = {
      content: [appointment],
      pageable: { pageNumber: 0, pageSize: 20 },
      totalPages: 1,
      totalElements: 1,
      last: true,
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(page)));
    const result = await new SchedulingApiGateway().searchAppointments({ from: "2026-01-01", to: "2026-01-02" }, "token");
    expect(result.content[0]?.id).toBe("a-1");
  });

  it("rejects a malformed mutation response instead of leaking unvalidated data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ id: "a-1" })));
    await expect(new SchedulingApiGateway().completeAppointment("a-1", "token")).rejects.toThrow();
  });

  it("preserves the RFC 7807 conflict response for appointment creation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ type: "about:blank", title: "Conflict", status: 409, detail: "Time slot is unavailable" }, 409)));
    const error = await new SchedulingApiGateway().createAppointment({
      title: "Cut", startsAt: appointment.startsAt, endsAt: appointment.endsAt,
      serviceId: "service-1", customerId: "customer-1", employeeId: "employee-1", establishmentId: "est-1",
    }, "token").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(SchedulingApiError);
    expect(error).toMatchObject({ status: 409, message: "Time slot is unavailable" });
  });
});
