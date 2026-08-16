import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  cookies: vi.fn(),
  shell: {
    resolve: vi.fn(),
  },
  landing: {
    resolveRoute: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("@/contexts/shared/application/internal/queryservices/app-shell-query.service", () => ({
  createAppShellQueryService: () => mocks.shell,
}));

vi.mock("@/contexts/shared/application/internal/queryservices/entry-route-query.service", () => ({
  createEntryRouteQueryService: () => mocks.landing,
}));

import HomePage from "@/app/page";

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.cookies.mockResolvedValue({
      get: () => ({ value: "access-token" }),
    });
  });

  it("redirects a new authenticated user to organization onboarding instead of access denied", async () => {
    mocks.shell.resolve.mockResolvedValue(null);
    mocks.landing.resolveRoute.mockResolvedValue({
      status: "organization-required",
      setupHref: "/organizations/new",
      allowedPaths: ["/organizations/new"],
    });

    await expect(HomePage()).rejects.toThrow("REDIRECT:/organizations/new");
  });

  it("uses the shell home when the workspace is ready", async () => {
    mocks.shell.resolve.mockResolvedValue({
      homeHref: "/chat",
    });

    await expect(HomePage()).rejects.toThrow("REDIRECT:/chat");
  });
});
