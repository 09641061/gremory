/** @vitest-environment jsdom */

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  listAppointmentsAction: vi.fn(),
  useNow: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/contexts/scheduling/interfaces/actions/list-appointments.action", () => ({
  listAppointmentsAction: (...args: unknown[]) =>
    (mocks.listAppointmentsAction as (...a: unknown[]) => unknown)(...args),
}));

vi.mock("@/contexts/scheduling/interfaces/components/use-now", () => ({
  useNow: () => mocks.useNow(),
}));

import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DailyStaffCalendar } from "@/contexts/scheduling/interfaces/components/calendar/daily-staff-calendar";
import { computeAppointmentTimes } from "@/contexts/scheduling/interfaces/components/appointment-form/scheduling-form-utils";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "@/contexts/scheduling/application/model/scheduling-page-data.view-model";
import type { Appointment } from "@/contexts/scheduling/domain/model/entities/appointment";

const members: SchedulingMemberViewModel[] = [
  {
    id: "mem-1",
    userId: "user-1",
    name: "Dr. House",
    email: "house@example.com",
    role: "Physician",
    status: "ACTIVE",
    imageUrl: null,
    isOwner: true,
    availableForScheduling: true,
  },
  {
    id: "mem-2",
    userId: "user-2",
    name: "Dr. Wilson",
    email: "wilson@example.com",
    role: "Oncologist",
    status: "ACTIVE",
    imageUrl: null,
    isOwner: false,
    availableForScheduling: true,
  },
];

const services: SchedulingServiceViewModel[] = [
  {
    id: "service-1",
    name: "Consultation",
    price: 150,
    durationMinutes: 45,
    preparationMinutes: 10,
    cleanupMinutes: 5,
  },
];

const customers: SchedulingCustomerViewModel[] = [
  { id: "cust-1", name: "Alice Smith", email: "alice@example.com", phone: "+51 987 654 321" },
];

const mockAppointment: Appointment = {
  id: "apt-1",
  title: "Alice Consultation",
  startsAt: "2026-10-26T10:00:00Z",
  endsAt: "2026-10-26T11:00:00Z",
  serviceId: "service-1",
  customerId: "cust-1",
  employeeId: "user-1",
  establishmentId: "est-1",
  status: "CONFIRMED",
  notes: "Client requested quiet room.",
  createdBy: "admin",
  cancellationReason: null,
  cancelledAt: null,
  deletedAt: null,
  createdAt: "2026-10-25T10:00:00Z",
  updatedAt: "2026-10-25T10:00:00Z",
};

describe("Scheduling Form Utils: Buffers", () => {
  it("includes preparation and cleanup minutes in total end time calculation", () => {
    const result = computeAppointmentTimes({
      startDate: "2026-10-26",
      startTime: "10:00",
      durationMinutes: 45,
      preparationMinutes: 10,
      cleanupMinutes: 5,
      timeZone: "UTC",
    });

    // 45 + 10 + 5 = 60 minutes
    expect(result.startsAt).toContain("2026-10-26T10:00:00");
    expect(result.endsAt).toContain("2026-10-26T11:00:00");
    expect(result.formattedEnd).toContain("60 mins duration");
  });
});

describe("DailyStaffCalendar Redesign Views and Panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listAppointmentsAction.mockResolvedValue({ content: [mockAppointment] });
    mocks.useNow.mockReturnValue(null);
  });

  it("renders view mode controls and switches to week and month views", async () => {
    render(
      <DailyStaffCalendar
        establishmentId="est-1"
        services={services}
        members={members}
        customers={customers}
        canCreateAppointment
        canUpdateAppointment
        canDeleteAppointment
        timeZone="UTC"
        currency="PEN"
      />
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    // In Day view initially, employee select is hidden
    expect(screen.queryByLabelText(/Todos los empleados|All employees/i)).toBeNull();

    // Switch to Week view (Semana / Week)
    const weekButton = screen.getByRole("button", { name: /semana|week/i });
    fireEvent.click(weekButton);

    // Employee select is now visible
    expect(screen.getByLabelText(/Todos los empleados|All employees/i)).toBeDefined();

    // Switch to Month view (Mes / Month)
    const monthButton = screen.getByRole("button", { name: /mes|month/i });
    fireEvent.click(monthButton);

    // Employee select is still visible in Month view
    expect(screen.getByLabelText(/Todos los empleados|All employees/i)).toBeDefined();
  });

  it("opens AppointmentDetailPanel when clicking an appointment and displays customer, notes and price", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-10-26T12:00:00Z"));

    render(
      <DailyStaffCalendar
        establishmentId="est-1"
        services={services}
        members={members}
        customers={customers}
        canCreateAppointment
        canUpdateAppointment
        canDeleteAppointment
        timeZone="UTC"
        currency="PEN"
      />
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    // Find appointment block
    const appointmentButton = screen.getByRole("button", { name: /Alice Smith/i });
    expect(appointmentButton).toBeDefined();

    // Panel is not rendered initially
    expect(screen.queryByTestId("appointment-detail-panel")).toBeNull();

    // Click to open panel
    fireEvent.click(appointmentButton);

    // Panel should now be open
    const panel = screen.getByTestId("appointment-detail-panel");
    expect(panel).toBeDefined();

    const panelQueries = within(panel);

    // Customer name and phone inside panel
    expect(panelQueries.getByText("Alice Smith")).toBeDefined();
    expect(panelQueries.getByText("+51 987 654 321")).toBeDefined();

    // Service, price (with S/ symbol for PEN), employee inside panel
    expect(panelQueries.getByText("Consultation")).toBeDefined();
    expect(panelQueries.getByText(/S\/ 150\.00/)).toBeDefined();
    expect(panelQueries.getByText(/Dr\. House/)).toBeDefined();

    // Notes
    expect(panelQueries.getByText("Client requested quiet room.")).toBeDefined();

    // Start button (for CONFIRMED appointment)
    const startButton = panelQueries.getByRole("button", { name: /iniciar|start/i });
    expect(startButton).toBeDefined();

    // Close panel
    const closeButton = panelQueries.getByLabelText(/cerrar|close/i);
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("appointment-detail-panel")).toBeNull();
    vi.useRealTimers();
  });

  it("renders currency in USD when specified", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-10-26T12:00:00Z"));

    render(
      <DailyStaffCalendar
        establishmentId="est-1"
        services={services}
        members={members}
        customers={customers}
        canCreateAppointment
        canUpdateAppointment
        canDeleteAppointment
        timeZone="UTC"
        currency="USD"
      />
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const appointmentButton = screen.getByRole("button", { name: /Alice Smith/i });
    fireEvent.click(appointmentButton);

    const panel = screen.getByTestId("appointment-detail-panel");
    expect(within(panel).getByText(/\$ 150\.00/)).toBeDefined();
    vi.useRealTimers();
  });
});
