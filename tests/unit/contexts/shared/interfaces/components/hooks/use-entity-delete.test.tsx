/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

import { useEntityDelete } from "@/contexts/shared/interfaces/components/hooks/use-entity-delete";

describe("useEntityDelete", () => {
  beforeEach(() => {
    mocks.refresh.mockClear();
  });

  it("opens the dialog once a target is requested", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useEntityDelete(action));

    expect(result.current.dialogProps.open).toBe(false);

    act(() => {
      result.current.requestDelete("est-1");
    });

    expect(result.current.targetId).toBe("est-1");
    expect(result.current.dialogProps.open).toBe(true);
  });

  it("cancels without invoking the action", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useEntityDelete(action));

    act(() => {
      result.current.requestDelete("est-1");
    });
    act(() => {
      result.current.dialogProps.onOpenChange(false);
    });

    expect(result.current.targetId).toBeNull();
    expect(action).not.toHaveBeenCalled();
  });

  it("refreshes the router and clears the target on success", async () => {
    const action = vi.fn().mockResolvedValue({ status: "success", data: null, error: null });
    const { result } = renderHook(() => useEntityDelete(action));

    act(() => {
      result.current.requestDelete("est-1");
    });

    const formData = new FormData();
    formData.append("id", "est-1");
    await act(async () => {
      result.current.dialogProps.formAction(formData);
    });

    expect(mocks.refresh).toHaveBeenCalled();
    expect(result.current.targetId).toBeNull();
  });

  it("keeps the dialog open and surfaces the error when the action fails", async () => {
    const action = vi.fn().mockResolvedValue({
      status: "error",
      data: null,
      error: "Cannot delete",
    });
    const { result } = renderHook(() => useEntityDelete(action));

    act(() => {
      result.current.requestDelete("est-1");
    });

    const formData = new FormData();
    formData.append("id", "est-1");
    await act(async () => {
      result.current.dialogProps.formAction(formData);
    });

    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(result.current.targetId).toBe("est-1");
    expect(result.current.dialogProps.open).toBe(true);
    expect(result.current.error).toBe("Cannot delete");
  });
});
