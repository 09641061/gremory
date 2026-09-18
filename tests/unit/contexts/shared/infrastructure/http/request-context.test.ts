import { describe, expect, it } from "vitest";

import { buildApiRequestHeaders } from "@/contexts/shared/infrastructure/http/request-context";

describe("API request context", () => {
  it("adds authorization and tenant headers", () => {
    expect(buildApiRequestHeaders({ token: "access-token", tenantId: "org-1" })).toEqual({
      Authorization: "Bearer access-token",
      "X-Organization-Id": "org-1",
    });
  });

  it("preserves caller-supplied headers over context defaults", () => {
    expect(
      buildApiRequestHeaders(
        { token: "access-token", tenantId: "org-1" },
        {
          Authorization: "Token custom",
          "X-Organization-Id": "custom-org",
          "Content-Type": "application/json",
        },
      ),
    ).toEqual({
      Authorization: "Token custom",
      "X-Organization-Id": "custom-org",
      "Content-Type": "application/json",
    });
  });
});
