import { describe, expect, it } from "vitest";

import {
  buildRequestContext,
  hasNonEmptyTenant,
} from "@/contexts/shared/infrastructure/http/request-context-builder";

describe("buildRequestContext", () => {
  it("generates a correlation id when none is provided", () => {
    const ctx = buildRequestContext({ token: "t" });
    expect(ctx.correlationId).toMatch(/^[A-Za-z0-9_-]{6,128}$/);
  });

  it("reuses an incoming correlation id when it matches the strict shape", () => {
    const ctx = buildRequestContext({ incomingCorrelationId: "abc-1234567890" });
    expect(ctx.correlationId).toBe("abc-1234567890");
  });

  it("replaces malformed incoming correlation ids with a fresh one", () => {
    const ctx = buildRequestContext({ incomingCorrelationId: "<script>alert(1)</script>" });
    expect(ctx.correlationId).not.toContain("<");
    expect(ctx.correlationId).toMatch(/^[A-Za-z0-9_-]{6,128}$/);
  });

  it("never emits blank token or tenant values", () => {
    const ctx = buildRequestContext({ token: "", tenantId: "   " });
    expect(ctx.token).toBeUndefined();
    expect(ctx.tenantId).toBeUndefined();
  });

  it("propagates the optional cancellation signal and timeout", () => {
    const controller = new AbortController();
    const ctx = buildRequestContext({ signal: controller.signal, timeoutMs: 1234 });
    expect(ctx.signal).toBe(controller.signal);
    expect(ctx.timeoutMs).toBe(1234);
  });

  it("hasNonEmptyTenant rejects empty or whitespace strings", () => {
    expect(hasNonEmptyTenant("org-1")).toBe(true);
    expect(hasNonEmptyTenant("")).toBe(false);
    expect(hasNonEmptyTenant("   ")).toBe(false);
    expect(hasNonEmptyTenant(undefined)).toBe(false);
  });
});
