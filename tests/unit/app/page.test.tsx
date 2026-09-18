import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  cookies: vi.fn(),
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

  it("sends an authenticated owner without a subscription to welcome", async () => {
    mocks.landing.resolveRoute.mockResolvedValue({
      status: "subscription-required",
      setupHref: "/welcome",
      allowedPaths: ["/welcome"],
    });

    await expect(
      HomePage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("REDIRECT:/welcome");
  });

  it("sends an active owner without an organization to organization onboarding", async () => {
    mocks.landing.resolveRoute.mockResolvedValue({
      status: "organization-required",
      setupHref: "/organizations/new",
      allowedPaths: ["/organizations/new"],
    });

    await expect(
      HomePage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("REDIRECT:/organizations/new");
  });

  it("uses the resolved workspace home when the account is ready", async () => {
    mocks.landing.resolveRoute.mockResolvedValue({
      status: "ready",
      homeHref: "/chat",
    });

    await expect(
      HomePage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("REDIRECT:/chat");
  });
});
