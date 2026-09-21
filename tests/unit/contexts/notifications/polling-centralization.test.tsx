/** @vitest-environment jsdom */
/**
 * Regression tests for the polling centralization refactor (Sprint 7).
 *
 * Before Sprint 7 every NotificationDropdown owned its own
 * `setInterval`, which meant:
 *
 *   - N dropdowns on a page produced N unread-count fetches per cycle
 *     (bandwidth + server load).
 *   - On unmount the dropdown could leak intervals when the cleanup
 *     path missed a branch (e.g. async resolution races with unmount).
 *   - The polling cadence could not be tuned centrally without
 *     refactoring every consumer.
 *
 * Sprint 7 moved the polling loop to a single `NotificationsProvider`
 * that `AppHeader` mounts. These tests pin the new invariants so a
 * future refactor cannot silently regress to per-consumer polling.
 *
 * No production files are modified.
 *
 * Implementation note: we observe the *observable* behaviour
 * (fetchUnreadNotificationsCountAction call rate) rather than spying
 * on `window.setInterval`. Vitest's `act` helper itself schedules
 * timers for bookkeeping, so spying on the global pollutes the count.
 * The fetch call rate is what end users would notice anyway.
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchNotificationsAction: vi.fn(),
  fetchUnreadNotificationsCountAction: vi.fn(),
  markNotificationAsReadAction: vi.fn(),
  deleteNotificationAction: vi.fn(),
  acceptInvitationNotificationAction: vi.fn(),
}));

vi.mock("@/contexts/notifications/interfaces/actions/notification.actions", () => ({
  fetchNotificationsAction: mocks.fetchNotificationsAction,
  fetchUnreadNotificationsCountAction: mocks.fetchUnreadNotificationsCountAction,
  markNotificationAsReadAction: mocks.markNotificationAsReadAction,
  deleteNotificationAction: mocks.deleteNotificationAction,
  acceptInvitationNotificationAction: mocks.acceptInvitationNotificationAction,
}));

import {
  NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS,
  NotificationsProvider,
  useNotifications,
} from "@/contexts/notifications/interfaces/components/hooks/use-notifications";
import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";

function makeEmptyPage() {
  return Promise.resolve({
    content: [],
    page: 0,
    size: 5,
    totalElements: 0,
    totalPages: 0,
  });
}

/**
 * Counts how many fetches happen within the window. Used to compare
 * fetch rates between configurations without depending on the global
 * timer spy (which is polluted by vitest's act bookkeeping).
 */
async function countFetchesOver(windowMs: number) {
  const start = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;
  await new Promise((resolve) => setTimeout(resolve, windowMs));
  const end = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;
  return end - start;
}

beforeEach(() => {
  mocks.fetchNotificationsAction.mockReset();
  mocks.fetchUnreadNotificationsCountAction.mockReset();
  mocks.markNotificationAsReadAction.mockReset();
  mocks.deleteNotificationAction.mockReset();
  mocks.acceptInvitationNotificationAction.mockReset();

  mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(0);
  mocks.fetchNotificationsAction.mockImplementation(() => makeEmptyPage());
  mocks.markNotificationAsReadAction.mockResolvedValue({ success: true });
  mocks.deleteNotificationAction.mockResolvedValue({ success: true });
  mocks.acceptInvitationNotificationAction.mockResolvedValue({ success: true });
});

// ---------------------------------------------------------------------------
// Test 1: multiple NotificationDropdowns inside the same provider share a
// single polling cycle. Only one fetch call per interval tick.
// ---------------------------------------------------------------------------

describe("NotificationsProvider polling — centralization invariants", () => {
  it("produces a single fetch per polling cycle regardless of how many dropdowns are mounted", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(2);

    // Render three dropdowns inside a single provider. Pre-Sprint-7 the
    // count fetch would fire three times per cycle (one per dropdown);
    // post-Sprint-7 only one fetch fires because the polling cadence
    // lives on the provider.
    render(
      <NotificationsProvider pollIntervalMs={50}>
        <NotificationDropdown />
        <NotificationDropdown />
        <NotificationDropdown />
      </NotificationsProvider>,
    );

    // Wait for the initial fetch (the provider's mount effect).
    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );

    // Allow several polling cycles to elapse. With one provider at
    // 50ms cadence over ~150ms we expect 3-4 calls (initial + ~2-3
    // ticks). Three dropdowns would yield 9-12 calls under the old
    // per-consumer polling design.
    await new Promise((resolve) => setTimeout(resolve, 150));

    const totalCalls = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;
    expect(totalCalls).toBeGreaterThanOrEqual(3);
    // Realistic upper bound for ~150ms at 50ms cadence. Anything
    // significantly above that signals more than one provider (or
    // per-consumer) interval is firing.
    expect(totalCalls).toBeLessThanOrEqual(7);
  });

  it("does not multiply fetch calls when dropdowns are nested under different wrappers", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(0);

    const Wrapper = ({ children }: { children: ReactNode }) => <div data-testid="wrap">{children}</div>;

    render(
      <NotificationsProvider pollIntervalMs={null}>
        <Wrapper>
          <NotificationDropdown />
        </Wrapper>
        <Wrapper>
          <NotificationDropdown />
        </Wrapper>
      </NotificationsProvider>,
    );

    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );

    expect(screen.getAllByRole("button", { name: "Notifications" })).toHaveLength(2);

    // With pollIntervalMs=null the provider does not schedule any
    // periodic fetches; the count must remain at exactly 1 even with
    // multiple consumers.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Test 2: provider cleanup correctly tears down the interval on unmount.
// No leaked intervals, no leaked fetches.
// ---------------------------------------------------------------------------

describe("NotificationsProvider polling — cleanup invariants", () => {
  it("stops fetching after unmount (no leaked intervals)", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(0);

    const { unmount } = render(
      <NotificationsProvider pollIntervalMs={50}>
        <NotificationDropdown />
      </NotificationsProvider>,
    );

    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );

    unmount();

    const callsBefore = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;

    // Wait long enough for any leaked interval to have fired several
    // times. If cleanup is broken, the count will grow.
    await new Promise((resolve) => setTimeout(resolve, 175));

    expect(mocks.fetchUnreadNotificationsCountAction.mock.calls.length).toBe(callsBefore);
  });

  it("never schedules a polling fetch when pollIntervalMs is null", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(0);

    render(
      <NotificationsProvider pollIntervalMs={null}>
        <NotificationDropdown />
      </NotificationsProvider>,
    );

    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );

    // Wait and confirm no fetches fire. With null cadence the provider
    // must not schedule any periodic work — the user explicitly opted
    // out.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
  });

  it("stops the previous polling cadence before starting a new one when pollIntervalMs changes", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(0);

    function Tree({ intervalMs }: { intervalMs: number | null }) {
      return (
        <NotificationsProvider pollIntervalMs={intervalMs}>
          <NotificationDropdown />
        </NotificationsProvider>
      );
    }

    const { rerender, unmount } = render(<Tree intervalMs={50} />);
    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );

    // Snapshot the fetch rate while the 50ms cadence is active.
    await new Promise((resolve) => setTimeout(resolve, 125));
    const callsAt50msBefore = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;
    expect(callsAt50msBefore).toBeGreaterThan(1);

    // Switch to a 150ms cadence. The previous interval must be cleared
    // before the new one starts, otherwise the fetch rate would not
    // slow down — both intervals would fire concurrently.
    rerender(<Tree intervalMs={150} />);

    // Measure the rate immediately after the switch. With the old
    // (broken) behaviour both intervals would fire and the rate would
    // stay at ~50ms cadence. With the new behaviour the rate should
    // slow to ~150ms cadence.
    const rateBeforeSwitch = await countFetchesOver(100);
    // Should be at most 1 fetch in 100ms with 150ms cadence. With a
    // leaked 50ms interval we'd see ~2 fetches in the same window.
    expect(rateBeforeSwitch).toBeLessThanOrEqual(1);

    unmount();

    // No extra fetches after unmount.
    const callsBefore = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(mocks.fetchUnreadNotificationsCountAction.mock.calls.length).toBe(callsBefore);
  });
});

// ---------------------------------------------------------------------------
// Test 3: pollIntervalMs is configurable, defaults to the documented
// constant, and accepts overrides (including the disable-to-null escape
// hatch).
// ---------------------------------------------------------------------------

describe("NotificationsProvider polling — configurability", () => {
  it("exposes a stable NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS so external tests can rely on it", () => {
    // Pin the default constant — Sprint 7 introduced it specifically
    // so future tests can assert against the production cadence without
    // hardcoding "15000" in multiple places.
    expect(typeof NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS).toBe("number");
    expect(NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS).toBeGreaterThan(0);
    // The default cadence is 15 seconds per the provider's
    // documentation; pin the value so a refactor cannot silently
    // change the production polling rate.
    expect(NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS).toBe(15_000);
  });

  it("honours an explicit pollIntervalMs override", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(0);

    const CUSTOM_INTERVAL_MS = 75;
    render(
      <NotificationsProvider pollIntervalMs={CUSTOM_INTERVAL_MS}>
        <NotificationDropdown />
      </NotificationsProvider>,
    );

    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );

    // With the override active we should see ~4 calls in ~300ms
    // (initial + 4 ticks at 75ms cadence). Without the override we
    // would see ~1 (initial only — the default is 15s). Generous
    // bounds absorb scheduler jitter.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const calls = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;
    expect(calls).toBeGreaterThanOrEqual(3);
    expect(calls).toBeLessThanOrEqual(7);
  });

  it("disables polling entirely when pollIntervalMs is null while keeping manual refresh() available", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(0);

    let api: ReturnType<typeof useNotifications> | null = null;
    function Capture() {
      api = useNotifications();
      return null;
    }

    render(
      <NotificationsProvider pollIntervalMs={null}>
        <NotificationDropdown />
        <Capture />
      </NotificationsProvider>,
    );

    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );

    // No interval fetches happened during the wait window.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);

    // Manual refresh() must still drive fetches so consumers can opt
    // out of polling without losing the ability to keep the badge in
    // sync.
    expect(api).not.toBeNull();
    await act(async () => {
      await api!.refresh();
    });

    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(2),
    );
  });
});
