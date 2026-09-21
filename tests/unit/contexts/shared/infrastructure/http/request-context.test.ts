import { describe, expect, it } from "vitest";

import {
  SERVER_AUTHORITATIVE_HEADERS,
  buildApiRequestHeaders,
} from "@/contexts/shared/infrastructure/http/request-context";

describe("API request context", () => {
  it("adds authorization and tenant headers", () => {
    expect(buildApiRequestHeaders({ token: "access-token", tenantId: "org-1" })).toEqual({
      Authorization: "Bearer access-token",
      "X-Organization-Id": "org-1",
    });
  });

  it("lets context-provided security headers win over caller-supplied ones", () => {
    const built = buildApiRequestHeaders(
      { token: "access-token", tenantId: "org-1", correlationId: "corr-1" },
      {
        Authorization: "Token custom",
        "X-Organization-Id": "custom-org",
        "X-Correlation-Id": "custom-corr",
        "Content-Type": "application/json",
      },
    );
    expect(built).toEqual({
      Authorization: "Bearer access-token",
      "X-Organization-Id": "org-1",
      "X-Correlation-Id": "corr-1",
      "Content-Type": "application/json",
    });
  });

  it("discards every casing variant of security headers supplied by the caller", () => {
    const built = buildApiRequestHeaders(
      { token: "access-token", tenantId: "org-1" },
      {
        authorization: "Bearer leaked",
        "x-organization-id": "leak-org",
        "X-ORGANIZATION-ID": "leak-org-2",
      },
    );
    expect(built).toEqual({
      Authorization: "Bearer access-token",
      "X-Organization-Id": "org-1",
    });
  });

  it("preserves non-security caller headers when no context value overrides them", () => {
    const built = buildApiRequestHeaders(
      { token: "access-token" },
      { Accept: "application/json", "Content-Type": "application/json" },
    );
    expect(built).toEqual({
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer access-token",
    });
  });

  it("only emits Authorization when a token is provided", () => {
    expect(buildApiRequestHeaders({ tenantId: "org-1" })).toEqual({
      "X-Organization-Id": "org-1",
    });
  });

  it("removes security headers when no trusted context value exists", () => {
    expect(buildApiRequestHeaders({}, {
      authorization: "Bearer spoofed",
      "x-organization-id": "spoofed-org",
      "x-correlation-id": "spoofed-correlation",
      Accept: "application/json",
    })).toEqual({ Accept: "application/json" });
  });

  it("exposes the list of authoritative headers so adapters can audit them", () => {
    expect(SERVER_AUTHORITATIVE_HEADERS).toContain("Authorization");
    expect(SERVER_AUTHORITATIVE_HEADERS).toContain("X-Organization-Id");
    expect(SERVER_AUTHORITATIVE_HEADERS).toContain("X-Correlation-Id");
  });
});
