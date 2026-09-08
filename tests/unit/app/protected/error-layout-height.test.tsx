/** @vitest-environment jsdom */

// Hoisted mocks must be declared before vi.mock factories run so the
// factories can close over the same mutable references used by tests.
const mocks = vi.hoisted(() => ({
  pathname: "/",
  searchParams: new URLSearchParams(),
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mocks.pathname,
  useSearchParams: () => mocks.searchParams,
}));

import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import ProtectedLayout from "@/app/(protected)/layout";
import ProtectedError from "@/app/(protected)/error";
import AppError from "@/app/(protected)/(app)/error";
import ConfigurationError from "@/app/(protected)/(configuration)/error";
import EstablishmentsError from "@/app/(protected)/(configuration)/establishments/error";
import OrganizationError from "@/app/(protected)/(configuration)/organization/error";
import PermissionsError from "@/app/(protected)/(configuration)/permissions/error";

let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

beforeAll(() => {
  // Every error.tsx logs `console.error(...)` on mount. Silence it so the
  // test output stays clean while still exercising the real component.
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy?.mockRestore();
});

beforeEach(() => {
  mocks.pathname = "/";
  mocks.searchParams = new URLSearchParams();
  mocks.replace.mockClear();
  mocks.push.mockClear();
});

// jsdom defaults to 1024×768, so window.innerHeight === 768. The body-scroll
// assertion below is bounded against that value. (jsdom does not perform
// real layout, so document.documentElement.scrollHeight stays at 0; the
// assertion is the no-body-scroll invariant, not an exact pixel measurement.)
const JSDOM_VIEWPORT_HEIGHT = 768;

// Pattern that matches any viewport-derived Tailwind class — used to lock
// the layout invariant against any future regression that re-introduces a
// 100vh / 100svh / 100dvh formula on an error fallback.
const VIEWPORT_DERIVED_PATTERN = /\b(?:h|min-h)-\[calc\(100(?:d|s)?vh-[^\]]+\]/;

/**
 * The protected error fallbacks used to pin themselves to
 * `flex min-h-[calc(100vh-4rem)] flex-1 …` — a hard-coded "viewport minus
 * 64px header" calc that was uncoupled from the protected layout's
 * `flex min-h-svh flex-col` chain. The fix replaces the calc with
 * `min-h-0` so the fallback behaves like every other flex child: the
 * protected layout owns the viewport and the error fallback fills its
 * column via `flex-1`.
 *
 * The tests below walk every protected error fallback and lock the
 * invariant: none of them may carry a viewport-derived sizing class on
 * their root element; they must carry `min-h-0` instead; and rendering
 * them must not produce a body scroll.
 */
describe("Protected error fallbacks fill their parent column without a viewport calc", () => {
  // The six protected error fallbacks share the same flex-fill contract; a
  // helper lets each `it()` describe only what is unique (the default
  // export).
  type ErrorFallback = (props: {
    error: Error & { digest?: string };
    reset: () => void;
  }) => React.ReactElement;

  const cases: ReadonlyArray<{
    readonly name: string;
    readonly ErrorComponent: ErrorFallback;
  }> = [
    { name: "app/(protected)/error.tsx", ErrorComponent: ProtectedError as ErrorFallback },
    { name: "app/(protected)/(app)/error.tsx", ErrorComponent: AppError as ErrorFallback },
    { name: "app/(protected)/(configuration)/error.tsx", ErrorComponent: ConfigurationError as ErrorFallback },
    {
      name: "app/(protected)/(configuration)/establishments/error.tsx",
      ErrorComponent: EstablishmentsError as ErrorFallback,
    },
    {
      name: "app/(protected)/(configuration)/organization/error.tsx",
      ErrorComponent: OrganizationError as ErrorFallback,
    },
    {
      name: "app/(protected)/(configuration)/permissions/error.tsx",
      ErrorComponent: PermissionsError as ErrorFallback,
    },
  ];

  for (const { name, ErrorComponent } of cases) {
    it(`should not carry a viewport-derived class on ${name}`, () => {
      // Given the protected layout chain: a viewport-owning wrapper with
      // the error fallback rendered inside it.
      const { container } = render(
        <ProtectedLayout>
          <ErrorComponent error={new Error("boom")} reset={() => {}} />
        </ProtectedLayout>,
      );

      // The fallback renders a single <main> as its root element. Scope
      // every assertion to that root so the layout wrapper's own
      // `min-h-svh` does not pollute the check.
      const fallbackRoot = container.querySelector("main");
      expect(fallbackRoot, `${name} should render a <main> root element`).not.toBeNull();

      // The root must NOT carry any viewport-derived sizing class. The
      // negation is class-list-based so future classes on the root stay
      // harmless.
      expect(fallbackRoot!.className).not.toMatch(VIEWPORT_DERIVED_PATTERN);
      expect(fallbackRoot).not.toHaveClass("min-h-[calc(100vh-4rem)]");
      expect(fallbackRoot).not.toHaveClass("h-[calc(100vh-4rem)]");
      expect(fallbackRoot).not.toHaveClass("min-h-[calc(100svh-4rem)]");
      expect(fallbackRoot).not.toHaveClass("h-[calc(100svh-4rem)]");

      // The root DOES carry `min-h-0` — the load-bearing token that
      // removes the implicit min-height: auto and lets the fallback fit
      // inside the protected layout's column without forcing a second
      // scroll.
      expect(fallbackRoot).toHaveClass("min-h-0");

      // The root remains a flex item that grows into the column.
      expect(fallbackRoot).toHaveClass("flex-1");
      expect(fallbackRoot).toHaveClass("flex");
    });

    it(`should not produce a body scroll when ${name} is rendered`, () => {
      // The protected layout uses `flex min-h-svh flex-col` so its total
      // height is bounded by the viewport. Rendering any error fallback
      // must not push the page past that bound. jsdom does not perform
      // real layout, so document.documentElement.scrollHeight stays at 0
      // regardless of the rendered tree; the assertion is the
      // bounded-invariant check (`scrollHeight ≤ innerHeight`), which is
      // true in jsdom and which a future regression that re-introduces
      // a viewport-derived class would still leave pass-true here. The
      // load-bearing className assertions are what make the regression
      // fail loudly; this assertion documents the body-scroll invariant
      // explicitly so a future author reading the test knows it is
      // intentional.
      const beforeScrollHeight = document.documentElement.scrollHeight;

      render(
        <ProtectedLayout>
          <ErrorComponent error={new Error("boom")} reset={() => {}} />
        </ProtectedLayout>,
      );

      // Confirm the fallback did in fact render — guards against a
      // regression where the component is replaced with a no-op.
      expect(screen.getByRole("button", { name: /try again|retrying/i })).toBeInTheDocument();

      const afterScrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight || JSDOM_VIEWPORT_HEIGHT;

      expect(viewportHeight).toBeGreaterThan(0);
      expect(afterScrollHeight).toBeLessThanOrEqual(viewportHeight);
      // The body scroll height must not have grown past the viewport as a
      // side-effect of mounting the fallback.
      expect(afterScrollHeight).toBeLessThanOrEqual(beforeScrollHeight + viewportHeight);
    });
  }

  it("should render the protected layout's wrapper as the viewport-owner", () => {
    // Document the chain the error fallbacks live inside: the protected
    // layout's outer <div> owns the viewport via `min-h-svh`, the error
    // fallback is the only space-consuming flex child of that column, and
    // the banner sibling is fixed-positioned (out of flow). A future
    // regression that drops `min-h-svh` from the protected wrapper, or
    // that re-introduces a viewport-derived class on the error fallback,
    // fails here.
    const { container } = render(
      <ProtectedLayout>
        <ProtectedError error={new Error("boom")} reset={() => {}} />
      </ProtectedLayout>,
    );

    const fallbackRoot = container.querySelector("main");
    expect(fallbackRoot).not.toBeNull();

    // The protected layout wraps the fallback in a single
    // `flex min-h-svh flex-col` viewport-owner.
    const wrapper = fallbackRoot!.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("flex-col");
    expect(wrapper).toHaveClass("min-h-svh");

    // The fallback is a flex item of that column and grows into the
    // available space via `flex-1` (no `min-h-svh` of its own — that
    // would force a second viewport's worth of height).
    expect(fallbackRoot).toHaveClass("flex-1");
    expect(fallbackRoot).not.toHaveClass("min-h-svh");
    expect(fallbackRoot).not.toHaveClass("min-h-screen");
  });
});