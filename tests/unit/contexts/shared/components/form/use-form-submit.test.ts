/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useFormSubmit } from "@/contexts/shared/interfaces/components/form/use-form-submit";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useFormSubmit — initial state", () => {
  it("starts with isSubmitting=false when no initial value is provided", () => {
    const { result } = renderHook(() => useFormSubmit());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.guard()).toBe(false);
  });

  it("honors an explicit initialSubmitting=true so callers can hydrate from a parent prop", () => {
    const { result } = renderHook(() => useFormSubmit(true));

    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.guard()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// submit() executes the callback
// ---------------------------------------------------------------------------

describe("useFormSubmit — submit() executes the callback", () => {
  it("invokes the supplied callback exactly once when no submission is in flight", async () => {
    const { result } = renderHook(() => useFormSubmit());
    const callback = vi.fn();

    let executed: boolean | undefined;
    await act(async () => {
      executed = await result.current.submit(callback);
    });

    expect(executed).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("flips isSubmitting to true while the callback is running and back to false when it resolves", async () => {
    const { result } = renderHook(() => useFormSubmit());

    let resolveCallback!: () => void;
    const callback = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCallback = resolve;
        }),
    );

    let pendingSubmit: Promise<boolean>;
    act(() => {
      pendingSubmit = result.current.submit(callback);
    });

    // Synchronous check via the ref-backed `isSubmitting` is true once
    // `submit()` has set the ref. The React state may not have committed
    // yet, but the ref is the source of truth for re-entry.
    expect(result.current.guard()).toBe(true);

    await act(async () => {
      resolveCallback();
      await pendingSubmit;
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.guard()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Re-entry blocking while submitting
// ---------------------------------------------------------------------------

describe("useFormSubmit — re-entry blocking", () => {
  it("skips the second submission while the first one is still in flight", async () => {
    const { result } = renderHook(() => useFormSubmit());

    let resolveFirst!: () => void;
    const first = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const second = vi.fn();

    let firstSubmit: Promise<boolean>;
    act(() => {
      firstSubmit = result.current.submit(first);
    });

    let secondResult: boolean | undefined;
    await act(async () => {
      secondResult = await result.current.submit(second);
    });

    expect(secondResult).toBe(false);
    expect(second).not.toHaveBeenCalled();
    expect(first).toHaveBeenCalledTimes(1);

    // Cleanup so the dangling promise doesn't leak past the test.
    await act(async () => {
      resolveFirst();
      await firstSubmit;
    });
  });

  it("allows a fresh submission to start once the previous one has settled", async () => {
    const { result } = renderHook(() => useFormSubmit());

    const first = vi.fn(async () => {
      await Promise.resolve();
    });
    const third = vi.fn();

    await act(async () => {
      await result.current.submit(first);
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.guard()).toBe(false);

    let thirdResult: boolean | undefined;
    await act(async () => {
      thirdResult = await result.current.submit(third);
    });

    expect(thirdResult).toBe(true);
    expect(third).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
  });

  it("still returns to the idle state when the callback throws (no leaked lock)", async () => {
    const { result } = renderHook(() => useFormSubmit());

    const failing = vi.fn(() => {
      throw new Error("boom");
    });

    await act(async () => {
      await expect(result.current.submit(failing)).rejects.toThrow("boom");
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.guard()).toBe(false);

    // A subsequent submission is no longer blocked by the stale lock.
    const recovery = vi.fn();
    let recoveryResult: boolean | undefined;
    await act(async () => {
      recoveryResult = await result.current.submit(recovery);
    });

    expect(recoveryResult).toBe(true);
    expect(recovery).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Sync vs async callbacks
// ---------------------------------------------------------------------------

describe("useFormSubmit — callback shapes", () => {
  it("accepts a synchronous callback and still resets state after it returns", async () => {
    const { result } = renderHook(() => useFormSubmit());
    const callback = vi.fn(() => 42);

    let executed: boolean | undefined;
    let returnValue: number | undefined;
    await act(async () => {
      executed = await result.current.submit(callback);
      returnValue = callback.mock.results[0]?.value as number | undefined;
    });

    expect(executed).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
    // The callback's return value is preserved — the hook does not consume it.
    expect(returnValue).toBe(42);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.guard()).toBe(false);
  });

  it("accepts an async callback and awaits its resolution", async () => {
    const { result } = renderHook(() => useFormSubmit());
    const callback = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "done";
    });

    let executed: boolean | undefined;
    await act(async () => {
      executed = await result.current.submit(callback);
    });

    expect(executed).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmitting).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// guard() synchronous check
// ---------------------------------------------------------------------------

describe("useFormSubmit — guard()", () => {
  it("returns the in-flight flag synchronously, matching isSubmitting on commit", async () => {
    const { result } = renderHook(() => useFormSubmit());

    expect(result.current.guard()).toBe(false);

    let resolve!: () => void;
    const callback = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );

    let pending: Promise<boolean>;
    act(() => {
      pending = result.current.submit(callback);
    });

    // Even before React commits `isSubmitting=true`, `guard()` already
    // sees the ref update. This is the whole reason for the ref + guard.
    expect(result.current.guard()).toBe(true);

    await act(async () => {
      resolve();
      await pending;
    });

    expect(result.current.guard()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Cleanup on unmount
// ---------------------------------------------------------------------------

describe("useFormSubmit — cleanup on unmount", () => {
  it("does not warn when submit() resolves after the component unmounted", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useFormSubmit());

    let resolve!: () => void;
    const callback = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );

    let pending: Promise<boolean>;
    act(() => {
      pending = result.current.submit(callback);
    });

    // Unmount while the callback is still in flight.
    unmount();

    // Resolving the promise now triggers the `finally` block with a
    // stale-mounted component. The hook must skip setIsSubmitting to
    // avoid the "Can't perform a React state update on an unmounted
    // component" warning that React emits in development.
    await act(async () => {
      resolve();
      await pending;
    });

    const stateWarnings = errorSpy.mock.calls.filter((args) => {
      const message = String(args[0] ?? "");
      return (
        message.includes("unmounted") ||
        message.includes("memory leak") ||
        message.includes("no-op")
      );
    });
    expect(stateWarnings).toEqual([]);

    errorSpy.mockRestore();
  });

  it("still runs the callback after unmount and the internal lock still settles", async () => {
    const { result, unmount } = renderHook(() => useFormSubmit());
    const callback = vi.fn();

    unmount();

    let executed: boolean | undefined;
    await act(async () => {
      executed = await result.current.submit(callback);
    });

    expect(executed).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
    // guard() reads the ref, which is updated regardless of mount state.
    expect(result.current.guard()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Stability of returned function identities
// ---------------------------------------------------------------------------

describe("useFormSubmit — returned function identities", () => {
  it("keeps `submit` and `guard` stable across renders so they are safe in effect deps", () => {
    const { result, rerender } = renderHook(() => useFormSubmit());

    const firstSubmit = result.current.submit;
    const firstGuard = result.current.guard;

    rerender();

    expect(result.current.submit).toBe(firstSubmit);
    expect(result.current.guard).toBe(firstGuard);
  });
});
