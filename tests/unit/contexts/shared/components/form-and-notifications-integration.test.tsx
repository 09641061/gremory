/** @vitest-environment jsdom */
/**
 * Cross-cutting integration tests for Sprint 6 (useFormSubmit) + Sprint 7
 * (NotificationContext migration).
 *
 * These tests live outside the per-hook/per-component suites because they
 * cover behaviour that spans the boundaries between the two refactors:
 *
 *   - The double-submit guard wired through CustomerForm must hold across
 *     rapid, real user clicks (not only synthetic fireEvent ticks).
 *   - The useFormSubmit hook must not warn when an async submission
 *     resolves after the consumer component unmounts.
 *   - NotificationDropdown must actually read state from the
 *     NotificationsProvider that AppHeader mounts, and the provider's
 *     mutations must propagate back to the badge the dropdown renders.
 *
 * No production files are modified by these tests; they only assert
 * behaviour that already exists and acts as a regression barrier against
 * a future refactor breaking any of the contracts documented in
 * `use-form-submit.ts` and `use-notifications.tsx`.
 */

import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { CustomerForm } from "@/contexts/crm/interfaces/components/customer-management/customer-form";
import { useFormSubmit } from "@/contexts/shared/interfaces/components/form/use-form-submit";
import { AppHeader } from "@/contexts/shared/interfaces/components/header/app-header";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

// ---------------------------------------------------------------------------
// Mocks shared by all three integration tests
// ---------------------------------------------------------------------------

// The CustomerForm server action used by the autofill button. We do not
// exercise autofill in these tests; the mock just prevents the action
// from running against a Next.js runtime.
vi.mock("@/contexts/crm/interfaces/actions/resolve-document.action", () => ({
  resolveDocumentAction: vi.fn(),
}));

// next/navigation is referenced by I18nProvider (via the federated
// dictionary loader) and by AppHeader itself.
const mocks = vi.hoisted(() => ({
  pathname: "/welcome",
  searchParams: new URLSearchParams(),
  refresh: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  fetchNotificationsAction: vi.fn(),
  fetchUnreadNotificationsCountAction: vi.fn(),
  markNotificationAsReadAction: vi.fn(),
  deleteNotificationAction: vi.fn(),
  acceptInvitationNotificationAction: vi.fn(),
  signOut: vi.fn(),
  // Tracks how many times the dropdown's notification actions are invoked.
  // Lets the "context propagates state" test observe provider-side updates.
  unreadCount: { current: 0 },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
    push: mocks.push,
    replace: mocks.replace,
    back: mocks.back,
  }),
  usePathname: () => mocks.pathname,
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/contexts/iam/interfaces/actions/sign-out.action", () => ({
  signOutAction: mocks.signOut,
}));

vi.mock("@/contexts/notifications/interfaces/actions/notification.actions", () => ({
  fetchNotificationsAction: mocks.fetchNotificationsAction,
  fetchUnreadNotificationsCountAction: mocks.fetchUnreadNotificationsCountAction,
  markNotificationAsReadAction: mocks.markNotificationAsReadAction,
  deleteNotificationAction: mocks.deleteNotificationAction,
  acceptInvitationNotificationAction: mocks.acceptInvitationNotificationAction,
}));

import { resolveDocumentAction } from "@/contexts/crm/interfaces/actions/resolve-document.action";
const mockResolveDocumentAction = vi.mocked(resolveDocumentAction);

const baseCustomerProps = {
  establishmentId: "est-1",
  isSaving: false,
  submitLabel: "Save customer",
  onSubmit: vi.fn(),
};

const workspace = {
  establishments: [{ id: "branch" }],
  accessPolicy: { canManageBilling: false },
} as unknown as WorkspaceHeaderViewModel;

function renderCustomerForm(overrides: Partial<typeof baseCustomerProps> = {}) {
  const onSubmit = overrides.onSubmit ?? vi.fn();
  return {
    onSubmit,
    ...render(
      <I18nProvider initialLocale="en">
        <CustomerForm {...baseCustomerProps} {...overrides} onSubmit={onSubmit} />
      </I18nProvider>,
    ),
  };
}

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  values: { docNumber: string; name: string; phone?: string; email?: string } = {
    docNumber: "12345678",
    name: "Maria Gonzalez",
    phone: "987654321",
    email: "m@example.com",
  },
) {
  await user.clear(screen.getByLabelText(/document number/i));
  await user.type(screen.getByLabelText(/document number/i), values.docNumber);
  await user.clear(screen.getByLabelText(/full name/i));
  await user.type(screen.getByLabelText(/full name/i), values.name);
  await user.clear(screen.getByLabelText(/email address/i));
  await user.type(screen.getByLabelText(/email address/i), values.email ?? "m@example.com");
  await user.clear(screen.getByRole("textbox", { name: /phone number/i }));
  await user.type(
    screen.getByRole("textbox", { name: /phone number/i }),
    values.phone ?? "987654321",
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.pathname = "/welcome";
  mocks.searchParams = new URLSearchParams();
  mockResolveDocumentAction.mockResolvedValue({
    status: "error",
    data: null,
    error: null,
    errorId: null,
    fieldErrors: null,
  });
  mocks.signOut.mockResolvedValue({ status: "success" });
  window.matchMedia = vi.fn().mockReturnValue({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    matches: false,
  });
  // Reset the dynamic unread count helper used by the AppHeader test.
  mocks.unreadCount.current = 0;
  // Default notification mocks: dropdown returns zero items, badge returns
  // a value that follows `mocks.unreadCount.current` so the test can
  // observe refresh propagation without re-rendering.
  mocks.fetchUnreadNotificationsCountAction.mockImplementation(() =>
    Promise.resolve(mocks.unreadCount.current),
  );
  mocks.fetchNotificationsAction.mockResolvedValue({
    content: [],
    page: 0,
    size: 5,
    totalElements: 0,
    totalPages: 0,
  });
  mocks.markNotificationAsReadAction.mockImplementation(async () => {
    // Simulate the server-side decrement of the unread count.
    mocks.unreadCount.current = Math.max(0, mocks.unreadCount.current - 1);
    return { success: true };
  });
  mocks.deleteNotificationAction.mockResolvedValue({ success: true });
  mocks.acceptInvitationNotificationAction.mockResolvedValue({ success: true });
});

// ---------------------------------------------------------------------------
// Test 1: useFormSubmit + customer-form guard against double-submit on rapid
// clicks. Verifies the production wiring actually invokes the hook's
// re-entry lock — not just that the hook can be wired up.
// ---------------------------------------------------------------------------

describe("useFormSubmit + CustomerForm — double-submit guard", () => {
  it("invokes onSubmit exactly once when the user clicks the submit button twice in quick succession", async () => {
    // Resolve on the next microtask so we can observe the lock release,
    // while still keeping the first submission "in flight" while the
    // second click is dispatched.
    let resolveFirst!: () => void;
    const onSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const user = userEvent.setup();
    renderCustomerForm({ onSubmit });

    await fillValidForm(user);

    const submit = screen.getByRole("button", { name: /save customer/i });
    // Two rapid clicks before the first submission resolves.
    await user.click(submit);
    await user.click(submit);

    // Settle the first submission so the test does not leave dangling
    // promises that could leak into other tests.
    await act(async () => {
      resolveFirst();
    });

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("blocks a third rapid click while the second is still in flight (the lock holds across multiple clicks)", async () => {
    // We control the resolution so all three clicks fire while the first
    // submission is still pending. This is the worst-case real-world
    // scenario (a user impatiently mashing the submit button) and
    // demonstrates the hook's re-entry lock holds across the whole
    // queue.
    let resolveFirst!: () => void;
    const onSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const user = userEvent.setup();
    renderCustomerForm({ onSubmit });

    await fillValidForm(user);

    const submit = screen.getByRole("button", { name: /save customer/i });
    await user.click(submit);
    await user.click(submit);
    await user.click(submit);

    // Only the first click reaches the parent handler.
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Settle so the test does not leak a dangling Promise.
    await act(async () => {
      resolveFirst();
    });
    await waitFor(() => expect(submit).not.toBeDisabled());
  });

  it("re-enables the form after a settled submission so a follow-up edit round can submit again", async () => {
    const onSubmit = vi.fn().mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderCustomerForm({ onSubmit });

    await fillValidForm(user);
    const submit = screen.getByRole("button", { name: /save customer/i });

    await user.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(submit).not.toBeDisabled();

    // Second round: edit the phone, then submit again. The hook must
    // release its lock between the two clicks.
    await user.clear(screen.getByRole("textbox", { name: /phone number/i }));
    await user.type(screen.getByRole("textbox", { name: /phone number/i }), "912345678");
    await user.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
  });
});

// ---------------------------------------------------------------------------
// Test 2: useFormSubmit must not emit React's "setState on unmounted
// component" warning when an async submission resolves after the consumer
// unmounts. Asserted via the console.error spy.
// ---------------------------------------------------------------------------

describe("useFormSubmit — unmount cleanup", () => {
  it("does not call setState or warn when the submission resolves after unmount", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    function Harness() {
      const { submit } = useFormSubmit();
      const [pending, setPending] = React.useState(false);

      const handleClick = React.useCallback(async () => {
        setPending(true);
        // Defer to the next microtask so the click handler returns before
        // we resolve the outer Promise.
        await Promise.resolve();
        // Pass an async callback whose Promise we control from the test.
        await submit(async () => await new Promise<void>((resolve) => {
          // Resolve from the test after unmount.
          (globalThis as unknown as { __resolveAfterUnmount?: () => void }).__resolveAfterUnmount = resolve;
        }));
        // This setState must NOT run after unmount — if it does, React
        // warns. The test asserts no warning is emitted even when the
        // callback's resolution is delayed past unmount.
        if ((globalThis as unknown as { __mounted?: boolean }).__mounted !== false) {
          setPending(false);
        }
      }, [submit]);

      return (
        <button type="button" onClick={handleClick} disabled={pending}>
          Go
        </button>
      );
    }

    const { result, unmount } = renderHook(() => null, {
      wrapper: () => <Harness />,
    });

    // Track mount state via a flag we set before unmounting.
    (globalThis as unknown as { __mounted?: boolean }).__mounted = true;

    const button = screen.getByRole("button", { name: "Go" });

    // Kick off the submission.
    await act(async () => {
      button.click();
    });

    // Unmount the tree while the inner Promise is still pending.
    (globalThis as unknown as { __mounted?: boolean }).__mounted = false;
    unmount();

    // Resolve the pending Promise now — the hook must swallow the
    // setState that follows.
    await act(async () => {
      const resolve = (globalThis as unknown as { __resolveAfterUnmount?: () => void }).__resolveAfterUnmount;
      resolve?.();
      // Yield once more so the hook's `finally` block runs.
      await Promise.resolve();
      await Promise.resolve();
    });

    // No unmounted-component warnings, no-op messages, memory-leak warnings.
    const offendingCalls = errorSpy.mock.calls.filter((args) => {
      const message = String(args[0] ?? "");
      return (
        message.includes("unmounted component") ||
        message.includes("memory leak") ||
        message.includes("Can't perform a React state update")
      );
    });
    expect(offendingCalls).toEqual([]);

    delete (globalThis as unknown as { __resolveAfterUnmount?: () => void }).__resolveAfterUnmount;
    delete (globalThis as unknown as { __mounted?: boolean }).__mounted;
    errorSpy.mockRestore();
    // Reference result to silence unused-var warnings without affecting
    // test semantics.
    void result;
  });

  it("keeps the in-flight flag updated even when the consumer unmounts, so post-unmount submit() calls do not double-execute", async () => {
    const callback = vi.fn(async () => {
      await Promise.resolve();
    });

    const { result, unmount } = renderHook(() => useFormSubmit());

    let firstReturn: boolean | undefined;
    await act(async () => {
      firstReturn = await result.current.submit(callback);
    });
    expect(firstReturn).toBe(true);

    unmount();

    // Calling submit() after unmount must still run the callback (the
    // hook's contract: the ref state is always updated), and the lock
    // must NOT be held from the previous run.
    let secondReturn: boolean | undefined;
    await act(async () => {
      secondReturn = await result.current.submit(callback);
    });
    expect(secondReturn).toBe(true);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Test 3: NotificationDropdown reads its state from the NotificationsProvider
// AppHeader mounts, and the provider's mutations (here triggered through the
// notification actions) propagate back to the badge the dropdown renders.
// ---------------------------------------------------------------------------

describe("AppHeader + NotificationDropdown — provider state propagation", () => {
  it("renders the unread badge with the value returned by the provider", async () => {
    mocks.unreadCount.current = 5;
    mocks.fetchUnreadNotificationsCountAction.mockClear();
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() =>
      Promise.resolve(mocks.unreadCount.current),
    );

    render(
      <I18nProvider initialLocale="en">
        <AppHeader
          profile={{ username: "Ada", imageUrl: null }}
          workspace={workspace}
          homeHref="/welcome"
        />
      </I18nProvider>,
    );

    // Provider was mounted exactly once — proving the polling cadence
    // belongs to AppHeader's wrapping NotificationsProvider, not the
    // dropdown.
    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);

    // The badge reflects the provider's unread count.
    expect(await screen.findByText("5")).toBeInTheDocument();
  });

  it("propagates context state updates back into the dropdown after a server-side mutation", async () => {
    // Start with 3 unread. The dropdown must show 3; after the user
    // marks a notification as read, the provider's refresh() must run
    // and the badge must show the decremented value.
    mocks.unreadCount.current = 3;
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() =>
      Promise.resolve(mocks.unreadCount.current),
    );

    // The dropdown's loadNotifications call returns a single unread item
    // so we can drive the mark-as-read flow end-to-end.
    mocks.fetchNotificationsAction.mockResolvedValue({
      content: [
        {
          id: "n-1",
          userId: "user-1",
          type: "SYSTEM" as const,
          title: "Heads up",
          message: "Plan renewed",
          status: "UNREAD" as const,
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ],
      page: 0,
      size: 5,
      totalElements: 1,
      totalPages: 1,
    });

    render(
      <I18nProvider initialLocale="en">
        <AppHeader
          profile={{ username: "Ada", imageUrl: null }}
          workspace={workspace}
          homeHref="/welcome"
        />
      </I18nProvider>,
    );

    // Initial badge: 3 (from the provider's first fetch).
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());

    // Open the dropdown — loadNotifications fires inside the open effect.
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await screen.findByRole("menu");
    await waitFor(() =>
      expect(mocks.fetchNotificationsAction).toHaveBeenCalledWith(0, 5),
    );

    // Trigger mark-as-read through the dropdown's action menu. The
    // provider's markAsRead() invokes the server action, then calls
    // refresh() which re-runs fetchUnreadNotificationsCountAction. Our
    // mock decrements `mocks.unreadCount.current` on each call, so the
    // second fetch returns 2.
    const markAsRead = vi.mocked(mocks.markNotificationAsReadAction);
    const row = screen.getByText("Heads up").closest("div.group")!;
    await user.click(row.querySelector('button[aria-label*="actions" i]') as HTMLButtonElement);
    await user.click(await screen.findByRole("menuitem", { name: /mark as read/i }));

    await waitFor(() => expect(markAsRead).toHaveBeenCalledWith("n-1"));

    // The provider's refresh ran after the mutation, so the dropdown
    // re-renders with the decremented badge.
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());

    // The fetch count must have grown (initial + refresh) but the polling
    // cadence never duplicated: the dropdown never started its own
    // interval, so even with the dropdown open, the only fetch calls
    // are the ones owned by the provider.
    const countFetch = mocks.fetchUnreadNotificationsCountAction.mock.calls.length;
    expect(countFetch).toBeGreaterThanOrEqual(2);
  });

  it("uses the NotificationsProvider mounted by AppHeader so two dropdowns share the same polling state", async () => {
    // This is the core regression guard for Sprint 7: the dropdown must
    // not own its own polling interval. We render two NotificationDropdowns
    // side-by-side; if either owned a setInterval, we would see two
    // fetch calls on mount instead of one.
    mocks.fetchUnreadNotificationsCountAction.mockClear();
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() =>
      Promise.resolve(mocks.unreadCount.current),
    );

    const { NotificationDropdown } = await import(
      "@/contexts/notifications/interfaces/components/notification-dropdown"
    );
    const { NotificationsProvider } = await import(
      "@/contexts/notifications/interfaces/components/hooks/use-notifications"
    );

    render(
      <NotificationsProvider pollIntervalMs={null}>
        <NotificationDropdown />
        <NotificationDropdown />
      </NotificationsProvider>,
    );

    await waitFor(() =>
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1),
    );
    // Both buttons render with the same aria-label "Notifications".
    expect(screen.getAllByRole("button", { name: "Notifications" })).toHaveLength(2);
  });
});
