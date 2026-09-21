import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect,
}));

import OrganizationsRoutePage from "@/app/(protected)/(configuration)/organizations/page";

describe("OrganizationsRoutePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects the legacy plural route to the single organization settings page", async () => {
    await OrganizationsRoutePage({
      searchParams: Promise.resolve({
        organizationId: "org-1",
        establishmentId: "est-1",
      }),
    });

    expect(redirect).toHaveBeenCalledWith(
      "/organization?establishmentId=est-1&organizationId=org-1",
    );
  });

  it("redirects without a query string when no workspace context is provided", async () => {
    await OrganizationsRoutePage({ searchParams: Promise.resolve({}) });

    expect(redirect).toHaveBeenCalledWith("/organization");
  });
});
