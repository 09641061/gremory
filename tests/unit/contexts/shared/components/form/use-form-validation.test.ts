/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useFormValidation } from "@/contexts/shared/interfaces/components/form/use-form-validation";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useFormValidation — initial state", () => {
  it("starts with an empty error map when no initialErrors is provided", () => {
    const { result } = renderHook(() => useFormValidation());

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });

  it("hydrates from initialErrors when provided", () => {
    const { result } = renderHook(() =>
      useFormValidation({ dni: "must be 8 digits", email: "invalid" }),
    );

    expect(result.current.errors).toEqual({
      dni: "must be 8 digits",
      email: "invalid",
    });
    expect(result.current.hasErrors).toBe(true);
  });

  it("treats initial entries whose value is undefined as no error", () => {
    const { result } = renderHook(() =>
      useFormValidation({ dni: undefined, email: "invalid" }),
    );

    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors.dni).toBeUndefined();
    expect(result.current.errors.email).toBe("invalid");
  });
});

// ---------------------------------------------------------------------------
// setError
// ---------------------------------------------------------------------------

describe("useFormValidation — setError", () => {
  it("records an error for the given field", () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.setError("dni", "must be 8 digits");
    });

    expect(result.current.errors.dni).toBe("must be 8 digits");
    expect(result.current.hasErrors).toBe(true);
  });

  it("flips hasErrors to true after the first error is recorded", () => {
    const { result } = renderHook(() => useFormValidation());

    expect(result.current.hasErrors).toBe(false);
    act(() => {
      result.current.setError("dni", "invalid");
    });
    expect(result.current.hasErrors).toBe(true);
  });

  it("overwrites a previous error for the same field", () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.setError("dni", "first message");
    });
    act(() => {
      result.current.setError("dni", "second message");
    });

    expect(result.current.errors.dni).toBe("second message");
    expect(Object.keys(result.current.errors)).toHaveLength(1);
  });

  it("stores errors for independent fields independently", () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.setError("dni", "invalid dni");
    });
    act(() => {
      result.current.setError("email", "invalid email");
    });

    expect(result.current.errors).toEqual({
      dni: "invalid dni",
      email: "invalid email",
    });
  });

  it("treats a null message as a clear (removes the field)", () => {
    const { result } = renderHook(() =>
      useFormValidation({ dni: "invalid", email: "invalid email" }),
    );

    act(() => {
      result.current.setError("dni", null);
    });

    expect(result.current.errors).toEqual({ email: "invalid email" });
    expect(result.current.hasErrors).toBe(true);
  });

  it("treats an undefined message as a clear (removes the field)", () => {
    const { result } = renderHook(() =>
      useFormValidation({ dni: "invalid", email: "invalid email" }),
    );

    act(() => {
      result.current.setError("dni", undefined);
    });

    expect(result.current.errors).toEqual({ email: "invalid email" });
  });

  it("treats an empty-string message as a clear", () => {
    const { result } = renderHook(() =>
      useFormValidation({ dni: "invalid" }),
    );

    act(() => {
      result.current.setError("dni", "");
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });

  it("is a no-op when setting null on a field that has no error", () => {
    const { result } = renderHook(() =>
      useFormValidation({ other: "stays" }),
    );

    act(() => {
      result.current.setError("dni", null);
    });

    expect(result.current.errors).toEqual({ other: "stays" });
  });
});

// ---------------------------------------------------------------------------
// clearError
// ---------------------------------------------------------------------------

describe("useFormValidation — clearError", () => {
  it("removes the error for the given field only", () => {
    const { result } = renderHook(() =>
      useFormValidation({ dni: "invalid", email: "invalid email" }),
    );

    act(() => {
      result.current.clearError("dni");
    });

    expect(result.current.errors).toEqual({ email: "invalid email" });
    expect(result.current.hasErrors).toBe(true);
  });

  it("flips hasErrors to false when clearing the last error", () => {
    const { result } = renderHook(() =>
      useFormValidation({ dni: "invalid" }),
    );

    expect(result.current.hasErrors).toBe(true);
    act(() => {
      result.current.clearError("dni");
    });
    expect(result.current.hasErrors).toBe(false);
  });

  it("is a no-op when clearing a field that has no error", () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.clearError("dni");
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clearAll
// ---------------------------------------------------------------------------

describe("useFormValidation — clearAll", () => {
  it("removes every error in one call", () => {
    const { result } = renderHook(() =>
      useFormValidation({
        dni: "invalid",
        email: "invalid email",
        phone: "invalid phone",
      }),
    );

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });

  it("is a no-op when there are no errors", () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasErrors stays accurate across mutations
// ---------------------------------------------------------------------------

describe("useFormValidation — hasErrors accuracy across mutations", () => {
  it("goes false → true → false as errors are set and cleared", () => {
    const { result } = renderHook(() => useFormValidation());

    expect(result.current.hasErrors).toBe(false);

    act(() => {
      result.current.setError("a", "bad");
    });
    expect(result.current.hasErrors).toBe(true);

    act(() => {
      result.current.clearError("a");
    });
    expect(result.current.hasErrors).toBe(false);

    act(() => {
      result.current.setError("b", "also bad");
      result.current.setError("c", "third");
    });
    expect(result.current.hasErrors).toBe(true);

    act(() => {
      result.current.clearAll();
    });
    expect(result.current.hasErrors).toBe(false);
  });
});
