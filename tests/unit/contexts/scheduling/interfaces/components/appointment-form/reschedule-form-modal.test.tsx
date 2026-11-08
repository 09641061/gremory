/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/scheduling/interfaces/actions/update-appointment.action", () => ({
  updateAppointmentAction: vi.fn(),
}));

import { RescheduleFormModal } from "@/contexts/scheduling/interfaces/components/appointment-form/reschedule-form-modal";
import type { Appointment } from "@/contexts/scheduling/domain/model/entities/appointment";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "@/contexts/scheduling/application/model/scheduling-page-data.view-model";

describe("RescheduleFormModal", () => {
  const dummyAppointment: Appointment = {
    id: "apt-123",
    title: "Haircut Session",
    startsAt: "2026-10-26T17:15:00.000Z", // 12:15 PM in America/Lima (UTC-5)
    endsAt: "2026-10-26T18:00:00.000Z",   // 01:00 PM in America/Lima (UTC-5)
    serviceId: "srv-1",
    customerId: "cust-1",
    employeeId: "emp-1",
    establishmentId: "est-1",
    status: "CONFIRMED",
    notes: "Regular cut",
    createdBy: "usr-1",
    cancellationReason: null,
    cancelledAt: null,
    deletedAt: null,
    createdAt: "2026-10-20T10:00:00Z",
    updatedAt: "2026-10-20T10:00:00Z",
  };

  const services: SchedulingServiceViewModel[] = [
    {
      id: "srv-1",
      name: "Haircut",
      price: 25,
      durationMinutes: 45,
      preparationMinutes: 0,
      cleanupMinutes: 0,
    },
  ];

  const members: SchedulingMemberViewModel[] = [
    {
      userId: "emp-1",
      name: "Barber Bob",
      role: "EMPLOYEE",
    },
  ];

  const customers: SchedulingCustomerViewModel[] = [
    {
      id: "cust-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
    },
  ];

  it("initializes date and time in the establishment timezone without local machine drift", () => {
    render(
      <RescheduleFormModal
        isOpen
        onOpenChange={vi.fn()}
        appointment={dummyAppointment}
        services={services}
        members={members}
        customers={customers}
        onSuccess={vi.fn()}
        onDeleteSuccess={vi.fn()}
        timeZone="America/Lima"
      />
    );

    // Dialog content renders in a portal on document.body
    const startsAtInput = document.body.querySelector<HTMLInputElement>('input[name="startsAt"]');
    const endsAtInput = document.body.querySelector<HTMLInputElement>('input[name="endsAt"]');

    expect(startsAtInput).not.toBeNull();
    expect(startsAtInput?.value).toBe("2026-10-26T12:15:00-05:00");
    expect(endsAtInput?.value).toBe("2026-10-26T13:00:00-05:00");

    // Verify the date trigger button displays the zoned date
    const dateButton = document.body.querySelector<HTMLButtonElement>("#reschedule-appointment-start-date");
    expect(dateButton).not.toBeNull();
    expect(dateButton?.textContent).toContain("2026");
    expect(dateButton?.textContent).toContain("26");

    // Verify the time trigger button displays the formatted 12:15 PM time
    expect(screen.getByText("12:15 PM")).toBeDefined();
  });
});
