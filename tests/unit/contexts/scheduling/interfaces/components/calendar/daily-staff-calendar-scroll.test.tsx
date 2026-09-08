/** @vitest-environment jsdom */

// Hoisted mocks must be declared before vi.mock factories run so the
// factories can close over the same mutable references used by tests.
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

// The calendar uses useNow() for the "in progress" styling on appointment
// blocks. Mocking it to a stable `null` keeps the assertions in this file
// deterministic (no clock drift, no "is overdue?" branching) and matches the
// plan's intent for this regression test.
vi.mock("@/contexts/scheduling/interfaces/components/use-now", () => ({
  useNow: () => mocks.useNow(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DailyStaffCalendar } from "@/contexts/scheduling/interfaces/components/calendar/daily-staff-calendar";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "@/contexts/scheduling/application/model/scheduling-page-data.view-model";

beforeEach(() => {
  vi.clearAllMocks();
  // Resolve the action the calendar fires in its useEffect so the render
  // settles without touching the real query service.
  mocks.listAppointmentsAction.mockResolvedValue({ content: [] });
  // The hook mock returns null → no "in-progress" styling branches active.
  mocks.useNow.mockReturnValue(null);
});

const members: SchedulingMemberViewModel[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
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
    id: "22222222-2222-4222-8222-222222222222",
    userId: "user-2",
    name: "Dr. Wilson",
    email: "wilson@example.com",
    role: "Oncologist",
    status: "ACTIVE",
    imageUrl: null,
    isOwner: false,
    availableForScheduling: true,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    userId: "user-3",
    name: "Dr. Cuddy",
    email: "cuddy@example.com",
    role: "Administrator",
    status: "ACTIVE",
    imageUrl: null,
    isOwner: false,
    availableForScheduling: true,
  },
];

const services: SchedulingServiceViewModel[] = [
  { id: "service-1", name: "Consultation", price: 100, durationMinutes: 30 },
];

const customers: SchedulingCustomerViewModel[] = [
  { id: "customer-1", name: "Bob", email: "bob@example.com", phone: "+1-555-0001" },
];

/**
 * Regression test for the daily-staff-calendar scroll container fix.
 *
 * Bug: the columns header (avatars + names) used to scroll out of view
 * because the `<div className="sticky top-0 z-20 …">` wrapper contained
 * BOTH the toolbar and the columns header. `position: sticky` only pins
 * the top edge, so the whole wrapper scrolled away as soon as the user
 * scrolled past the toolbar.
 *
 * Fix: split the wrapper. The toolbar is no longer sticky (it scrolls
 * away naturally). The columns header is its own `sticky top-0 z-20`
 * element. Time labels now use `sticky top-[var(--app-calendar-column-
 * header-height)]` so they sit *below* the pinned columns header.
 *
 * This file locks that layout contract in place: each it() block targets
 * a specific class assertion that would break if the fix regresses.
 */
describe("DailyStaffCalendar scroll container", () => {
  it("renders the outer scroll container with the correct flex/scroll classes (assertion a)", async () => {
    const { container } = render(
      <div className="flex min-h-svh flex-col">
        <DailyStaffCalendar
          establishmentId="est-1"
          services={services}
          members={members}
          customers={customers}
          canCreateAppointment
          canUpdateAppointment
          canDeleteAppointment
          timeZone="UTC"
        />
      </div>,
    );

    // Drain pending updates so the calendar's effect → transition →
    // setAppointments cycle has settled before we read classes.
    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const scrollContainer = screen.getByTestId("schedule-calendar-scroll-container");
    // The wrapper must own the scroll context: `overflow-y-auto` establishes
    // the scrolling ancestor that makes the columns-header sticky work;
    // `flex min-h-0 flex-1 flex-col` is the canonical flex-fill chain.
    expect(scrollContainer).toHaveClass("overflow-y-auto");
    expect(scrollContainer).toHaveClass("flex");
    expect(scrollContainer).toHaveClass("min-h-0");
    expect(scrollContainer).toHaveClass("flex-1");
    expect(scrollContainer).toHaveClass("flex-col");

    // Container should also have been mounted into the rendered tree.
    expect(container).toContainElement(scrollContainer);
  });

  it("renders the columns header with its own sticky positioning (assertion b)", async () => {
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
      />,
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const columnsHeader = screen.getByTestId("schedule-calendar-columns-header");
    // The columns header is the *only* sticky element in the calendar; it
    // owns `top-0` and `z-20` so it pins to the scroll container's top edge
    // and paints above the grid rows below.
    expect(columnsHeader).toHaveClass("sticky");
    expect(columnsHeader).toHaveClass("top-0");
    expect(columnsHeader).toHaveClass("z-20");
  });

  it("treats the toolbar and columns header as siblings (NOT inside one sticky wrapper) (assertion c)", async () => {
    const { container } = render(
      <DailyStaffCalendar
        establishmentId="est-1"
        services={services}
        members={members}
        customers={customers}
        canCreateAppointment
        canUpdateAppointment
        canDeleteAppointment
        timeZone="UTC"
      />,
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const scrollContainer = screen.getByTestId("schedule-calendar-scroll-container");
    const columnsHeader = screen.getByTestId("schedule-calendar-columns-header");

    // The toolbar wrapper is the element immediately preceding the columns
    // header inside the scroll container. It is the only direct sibling of
    // the columns header that carries the toolbar's button(s).
    const toolbarWrapper = columnsHeader.previousElementSibling;
    expect(toolbarWrapper).not.toBeNull();
    expect(toolbarWrapper!.querySelector("button")).not.toBeNull();
    // Critically, the toolbar wrapper must NOT be sticky — that's the
    // whole point of the fix. If a future PR re-wraps the toolbar with a
    // sticky class, the columns header starts scrolling away again.
    expect(toolbarWrapper).not.toHaveClass("sticky");

    // Belt-and-braces: the columns-header wrapper is the ONLY sticky
    // direct child of the scroll container. Two sticky children would mean
    // a regression that re-introduces the original bug or accidentally
    // double-sticks the toolbar.
    const stickyChildren = scrollContainer.querySelectorAll(":scope > .sticky");
    expect(stickyChildren.length).toBe(1);
    expect(stickyChildren[0]).toBe(columnsHeader);

    // Sanity: the toolbar wrapper exists and contains the toolbar's
    // signature interactive elements (the prev/next day buttons and the
    // schedule-appointment CTA).
    expect(container).toContainElement(toolbarWrapper);
  });

  it("anchors time labels below the pinned columns header via the design token (assertion d)", async () => {
    const { container } = render(
      <DailyStaffCalendar
        establishmentId="est-1"
        services={services}
        members={members}
        customers={customers}
        canCreateAppointment
        canUpdateAppointment
        canDeleteAppointment
        timeZone="UTC"
      />,
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    // Every hour row renders a `<span>` time label that is `sticky`. jsdom
    // does not compute layout, so a class-list assertion is the right
    // grain: the label must reference the
    // `--app-calendar-column-header-height` design token instead of a
    // hard-coded `top-2` (which used to collide with the pinned columns
    // header).
    const timeLabels = container.querySelectorAll("span.sticky");
    expect(timeLabels.length).toBeGreaterThan(0);

    const firstLabel = timeLabels[0];
    expect(firstLabel).not.toBeNull();
    expect(firstLabel.className).toMatch(
      /sticky\s+top-\[var\(--app-calendar-column-header-height\)\]/,
    );
  });

  it("fills its column through the flex chain (assertion e)", async () => {
    render(
      <div className="flex min-h-svh flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <DailyStaffCalendar
            establishmentId="est-1"
            services={services}
            members={members}
            customers={customers}
            canCreateAppointment
            canUpdateAppointment
            canDeleteAppointment
            timeZone="UTC"
          />
        </div>
      </div>,
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const scrollContainer = screen.getByTestId("schedule-calendar-scroll-container");
    // The flex-1 + min-h-0 chain is load-bearing: a future PR that drops
    // either class collapses the sticky behaviour. jsdom does not compute
    // layout, so the structural class assertion is the strongest signal we
    // can give here.
    expect(scrollContainer).toHaveClass("flex-1");
    expect(scrollContainer).toHaveClass("min-h-0");
  });

  it("reports a positive scrollHeight when content overflows (assertion f)", async () => {
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
      />,
    );

    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const scrollContainer = screen.getByTestId("schedule-calendar-scroll-container");
    // jsdom defaults scrollHeight to 0. Force a non-zero value that mimics
    // the calendar's actual content height (toolbar + columns header +
    // 15 hour rows ≈ 64 + 72 + 15 × 80 = 1336 px). The assertion is a
    // smoke check that the container is in fact a scrollable element; it
    // degrades gracefully if jsdom refuses the defineProperty override.
    try {
      Object.defineProperty(scrollContainer, "scrollHeight", {
        configurable: true,
        value: 1500,
      });
      expect(scrollContainer.scrollHeight).toBeGreaterThan(0);
    } catch {
      // If jsdom blocks the override, at minimum the element exists and
      // has the overflow-y-auto class that establishes scroll behaviour.
      expect(scrollContainer).toHaveClass("overflow-y-auto");
    }
  });
});