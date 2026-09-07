import { describe, expect, it } from "vitest";

import {
  createActionErrorId,
  createErrorActionState,
  createIdleActionState,
  createSuccessActionState,
} from "@/contexts/shared/application/model/action-state";

describe("action state contract", () => {
  it("creates the canonical idle state", () => {
    expect(createIdleActionState<string>()).toEqual({
      status: "idle",
      data: null,
      error: null,
      errorId: null,
      fieldErrors: null,
    });
  });

  it("creates the canonical success state", () => {
    expect(createSuccessActionState<string, null>("ok")).toEqual({
      status: "success",
      data: "ok",
      error: null,
      errorId: null,
      fieldErrors: null,
    });
  });

  it("creates the canonical error state with a stable error id when provided", () => {
    expect(createErrorActionState<string>("Invalid", null, "error-123")).toEqual({
      status: "error",
      data: null,
      error: "Invalid",
      errorId: "error-123",
      fieldErrors: null,
    });
  });

  it("generates a non-empty error id", () => {
    expect(createActionErrorId()).toMatch(/^[0-9]+-[a-z0-9]+$/);
  });
});
