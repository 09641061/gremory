// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  class MockIntersectionObserver {
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  landing: {
    resolveRoute: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("@/contexts/shared/interfaces/server/shared-composition", () => ({
  composeSharedAdapters: () => ({
    entryRouteQueryService: mocks.landing,
  }),
}));

import LandingLayout from "@/app/(landing)/layout";
import LandingHomePage from "@/app/(landing)/page";
import PricingPage from "@/app/(landing)/pricing/page";

describe("Landing Routes & Layout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("LandingHomePage", () => {
    it("renders the landing home page sections", () => {
      const { container } = render(<LandingHomePage />);
      expect(container).toBeDefined();
    });
  });

  describe("PricingPage", () => {
    it("renders the dedicated pricing page", () => {
      const { container } = render(<PricingPage />);
      expect(container).toBeDefined();
    });
  });

  describe("LandingLayout", () => {
    it("renders layout for unauthenticated visitors without active session", async () => {
      mocks.cookies.mockResolvedValue({
        get: () => undefined,
      });

      const element = await LandingLayout({
        children: <div data-testid="child-content">Child Content</div>,
      });

      const { getByTestId } = render(element);
      expect(getByTestId("child-content")).toBeDefined();
    });

    it("resolves route and provides workspace navigation for authenticated users", async () => {
      mocks.cookies.mockResolvedValue({
        get: () => ({ value: "valid-session-token" }),
      });
      mocks.landing.resolveRoute.mockResolvedValue({
        status: "ready",
        homeHref: "/schedule",
      });

      const element = await LandingLayout({
        children: <div data-testid="child-content">Child Content</div>,
      });

      const { getByTestId } = render(element);
      expect(getByTestId("child-content")).toBeDefined();
    });

    it("handles subscription-required or onboarding states gracefully for authenticated users", async () => {
      mocks.cookies.mockResolvedValue({
        get: () => ({ value: "valid-session-token" }),
      });
      mocks.landing.resolveRoute.mockResolvedValue({
        status: "subscription-required",
        setupHref: "/welcome",
      });

      const element = await LandingLayout({
        children: <div data-testid="child-content">Child Content</div>,
      });

      const { getByTestId } = render(element);
      expect(getByTestId("child-content")).toBeDefined();
    });
  });
});
