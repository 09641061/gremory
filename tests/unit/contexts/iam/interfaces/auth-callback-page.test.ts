import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  authCallback: vi.fn((props: { returnTo: string | null }) => props.returnTo),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/contexts/iam/interfaces/components/auth-callback", () => ({
  AuthCallback: mocks.authCallback,
}));

import AuthCallbackPage, * as authCallbackPageModule from "@/app/auth/callback/page";

const returnToCookie = (value?: string) => ({
  get: () => (value === undefined ? undefined : { value }),
});

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.cookies.mockResolvedValue(returnToCookie());
  });

  it("should prefer a safe query returnTo over the cookie returnTo", async () => {
    mocks.cookies.mockResolvedValue(returnToCookie("/cookie-target"));

    const result = await AuthCallbackPage({
      searchParams: Promise.resolve({ next: "/query-target" }),
    });

    expect(result).toMatchObject({ props: { returnTo: "/query-target" } });
  });

  it("should preserve the cookie returnTo when no query returnTo exists", async () => {
    mocks.cookies.mockResolvedValue(returnToCookie("/cookie-target"));

    const result = await AuthCallbackPage({ searchParams: Promise.resolve({}) });

    expect(result).toMatchObject({ props: { returnTo: "/cookie-target" } });
  });

  it("should declare a blocking strategy for request-bound OAuth inputs", () => {
    expect(authCallbackPageModule.instant).toBe(false);
  });
});
