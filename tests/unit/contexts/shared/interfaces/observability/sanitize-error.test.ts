import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ensureDiagnosticRing,
  readDiagnosticRing,
  recordSafely,
} from "@/contexts/shared/interfaces/observability/sanitize-error";

beforeEach(() => {
  ensureDiagnosticRing();
});

afterEach(() => {
  const g = globalThis as { __diag_ring__?: unknown };
  delete g.__diag_ring__;
});

describe("recordSafely", () => {
  it("never logs raw body, headers, or tokens to the host console", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    recordSafely("billing.invoice.failed", {
      correlationId: "corr-1",
      status: 502,
      code: "UPSTREAM_UNAVAILABLE",
      context: {
        Authorization: "Bearer leaked-token",
        cookie: "session=leaked",
        password: "hunter2",
      },
      cause: new Error("upstream timeout"),
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("redacts forbidden keys", () => {
    recordSafely("crm.resolve.failed", {
      context: {
        Authorization: "Bearer t",
        "X-Api-Key": "secret",
        token: "abc",
        stripeClientSecret: "sk_test_xxx",
        other: "kept",
      },
    });
    const ring = readDiagnosticRing();
    expect(ring).toHaveLength(1);
    const ctx = ring[0]?.context as Record<string, unknown>;
    expect(ctx).toEqual({
      Authorization: "[redacted]",
      "X-Api-Key": "[redacted]",
      token: "[redacted]",
      stripeClientSecret: "[redacted]",
      other: "kept",
    });
  });

  it("does not crash on circular causes", () => {
    const a: Record<string, unknown> = { name: "A" };
    a.self = a;
    recordSafely("any.event", { cause: a });
    const ring = readDiagnosticRing();
    expect(ring).toHaveLength(1);
    expect(ring[0]?.cause).toMatchObject({ name: "A", self: "[circular]" });
  });

  it("truncates very long stacks and messages", () => {
    const cause = new Error("x".repeat(2048));
    cause.stack = "y".repeat(4096);
    recordSafely("any.event", { cause });
    const ring = readDiagnosticRing();
    const safeCause = ring[0]?.cause as { message: string; stack?: string };
    expect(safeCause.message.length).toBeLessThanOrEqual(257);
    expect((safeCause.stack ?? "").length).toBeLessThanOrEqual(1025);
  });

  it("preserves explicit status and code without leaking message text", () => {
    recordSafely("iam.sign-out", {
      status: 401,
      code: "UNAUTHENTICATED",
      cause: new Error("internal: token expired at 12:34"),
    });
    const ring = readDiagnosticRing();
    expect(ring[0]).toMatchObject({
      event: "iam.sign-out",
      level: "error",
      status: 401,
      code: "UNAUTHENTICATED",
    });
  });
});
