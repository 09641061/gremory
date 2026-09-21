import { describe, expect, it } from "vitest";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

describe("safePublicError", () => {
  it("does not expose upstream message or details", () => {
    const result = safePublicError(new ApiError("database password leaked", 502, { token: "secret" }), "Fallback");
    expect(result).toEqual({ message: "Upstream service unavailable", status: 502 });
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("maps unknown failures to a stable server error", () => {
    expect(safePublicError(new Error("private stack"), "Could not save")).toEqual({ message: "Could not save", status: 500 });
  });
});
