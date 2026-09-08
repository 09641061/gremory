/** @vitest-environment jsdom */

// Hoisted mocks must be declared before vi.mock factories run so the
// factories can close over the same mutable references used by tests.
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  listAppointmentsAction: vi.fn(),
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

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DailyStaffCalendar } from "@/contexts/scheduling/interfaces/components/calendar/daily-staff-calendar";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "@/contexts/scheduling/application/model/scheduling-page-data.view-model";

beforeEach(() => {
  vi.clearAllMocks();
  // The calendar fetches appointments in an effect; resolve with an empty
  // page so the effect settles without hitting the real query service.
  mocks.listAppointmentsAction.mockResolvedValue({ content: [] });
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
];

const services: SchedulingServiceViewModel[] = [
  { id: "service-1", name: "Consultation", price: 100, durationMinutes: 30 },
];

const customers: SchedulingCustomerViewModel[] = [
  { id: "customer-1", name: "Bob", email: "bob@example.com", phone: "+1-555-0001" },
];

/**
 * The calendar used to pin itself to `h-[calc(100dvh-6rem)]` — a hard-coded
 * viewport-derived height that coupled it to a hypothetical 64px header plus
 * a 32px buffer and would either under-fill the column or push the page past
 * the viewport whenever the header height changed. The fix replaces the calc
 * with `min-h-0 flex-1` so the calendar fills its parent through the flex
 * chain instead.
 *
 * The tests below lock that invariant in place: any future regression that
 * re-introduces a viewport-derived calc on the calendar (or strips the
 * flex-fill classes) fails loudly here.
 */
describe("DailyStaffCalendar layout invariant", () => {
  it("fills its parent via flex instead of a viewport-derived calc", async () => {
    // Given the schedule route's flex chain: the protected layout owns the
    // viewport, the schedule `<main>` supplies the available column height,
    // and the calendar is the only child of that column.
    const { container } = render(
      <div data-testid="viewport-owner" className="flex min-h-svh flex-col">
        <div data-testid="main" className="flex min-h-0 flex-1 flex-col">
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

    // Drain pending updates from the calendar's useEffect →
    // startTransition → setAppointments cycle, plus the
    // useSyncExternalStore snapshot inside useNow(). waitFor wraps
    // each poll in act(...) so React does not warn about untracked
    // state updates. The assertion itself documents the contract:
    // "by the time we check layout classes, the fetch has happened".
    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const main = container.querySelector('[data-testid="main"]');
    expect(main).not.toBeNull();

    // The calendar's outer wrapper is the only direct child div of <main>;
    // it is the element we are pinning the layout invariant on.
    const calendarContainer = main!.querySelector(":scope > div");
    expect(calendarContainer).not.toBeNull();

    // The calendar container does NOT pin itself to a viewport-derived
    // calc. Any future regression that re-introduces a 100dvh/100svh/100vh
    // formula on the calendar (in any class) fails here.
    const className = calendarContainer!.className;
    expect(className).not.toMatch(/\bh-\[calc\(100d?vh-/);
    expect(className).not.toMatch(/\bh-\[calc\(100svh-/);
    expect(className).not.toMatch(/\bmin-h-\[calc\(100d?vh-/);
    expect(calendarContainer).not.toHaveClass("h-[calc(100dvh-6rem)]");
    expect(calendarContainer).not.toHaveClass("h-[calc(100vh-6rem)]");
    expect(calendarContainer).not.toHaveClass("h-[calc(100svh-6rem)]");
    expect(calendarContainer).not.toHaveClass("min-h-[calc(100dvh-6rem)]");
    expect(calendarContainer).not.toHaveClass("min-h-[calc(100vh-6rem)]");
    expect(calendarContainer).not.toHaveClass("min-h-[calc(100svh-6rem)]");

    // The container DOES fill its parent through the canonical flex-fill
    // pattern: `min-h-0` removes the implicit min-height: auto that would
    // let it grow past its parent; `flex-1` makes it grow into the column;
    // `flex flex-col` lets its inner scroller be the bounded scroll context.
    expect(calendarContainer).toHaveClass("min-h-0");
    expect(calendarContainer).toHaveClass("flex-1");
    expect(calendarContainer).toHaveClass("flex");
    expect(calendarContainer).toHaveClass("flex-col");

    // The inner scroller that handles long appointment lists stays inside
    // the calendar — the outer container must not attempt to clip or scroll
    // the page itself.
    expect(calendarContainer).toHaveClass("overflow-y-auto");
  });

  it("remains free of viewport-derived classes in any descendant element", async () => {
    // Belt-and-braces: the original regression lived on the calendar's outer
    // wrapper, but a future regression that moves the calc onto a deeper
    // descendant would still produce the same scroll bug. Scan the full
    // rendered tree of the calendar and assert that NO element carries a
    // viewport-derived class — neither `h-[calc(100dvh-…)]`,
    // `h-[calc(100svh-…)]`, nor `h-[calc(100vh-…)]` (and the matching
    // `min-h-[…]` variants).
    const { container } = render(
      <div data-testid="viewport-owner" className="flex min-h-svh flex-col">
        <div data-testid="main" className="flex min-h-0 flex-1 flex-col">
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

    // Same drain as the sibling test — see the comment above.
    await waitFor(() => {
      expect(mocks.listAppointmentsAction).toHaveBeenCalled();
    });

    const calendarTree = container.querySelector(
      '[data-testid="main"] > div',
    );
    expect(calendarTree).not.toBeNull();

    const viewportDerivedPattern =
      /\b(?:h|min-h)-\[calc\(100(?:d|s)?vh-[^\]]+\]/;

    // Walk every element inside the calendar and assert none of them carry
    // a viewport-derived sizing class. SVG elements expose `className` as
    // an `SVGAnimatedString` (not a string), so we coerce via `String(...)`
    // to keep the assertion stable across HTML and SVG nodes.
    const allElements = calendarTree!.querySelectorAll("*");
    for (const element of allElements) {
      const rawClassName = (element as Element).getAttribute("class") ?? "";
      const tag = element.tagName.toLowerCase();
      expect(
        rawClassName,
        `${tag} should not pin itself to a viewport-derived calc`,
      ).not.toMatch(viewportDerivedPattern);
    }
  });
});