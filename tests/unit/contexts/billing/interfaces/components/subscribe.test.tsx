/** @vitest-environment jsdom */
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { SubscribeView } from "@/contexts/billing/interfaces/components/subscribe/subscribe-view";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("@/contexts/billing/interfaces/actions/create-subscription.action", () => ({
  createSubscriptionAction: vi.fn().mockResolvedValue({
    status: "success",
    data: {
      id: "sub_123",
      ownerId: "owner_123",
      planId: 1,
      billingCycle: "ANNUAL",
      status: "PENDING",
      clientSecret: "pi_123_secret_456",
      stripePublicKey: "pk_test_123",
    },
    error: null,
  }),
}));

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn().mockResolvedValue({}),
}));

vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Stripe Payment Element</div>,
  CardElement: () => <div data-testid="card-element">Stripe Card Element</div>,
  useStripe: () => ({ confirmCardPayment: vi.fn() }),
  useElements: () => ({ getElement: vi.fn() }),
}));

const plansByCurrency = {
  USD: [
    { id: 0, name: "Free", maxEstablishments: 1, monthlyPriceAmount: 0, annualPriceAmount: 0, currency: "USD", active: true },
    { id: 1, name: "Standard", maxEstablishments: 1, monthlyPriceAmount: 20, annualPriceAmount: 200, currency: "USD", active: true },
    { id: 2, name: "Premium", maxEstablishments: -1, monthlyPriceAmount: 50, annualPriceAmount: 500, currency: "USD", active: true },
  ],
  PEN: [
    { id: 0, name: "Free", maxEstablishments: 1, monthlyPriceAmount: 0, annualPriceAmount: 0, currency: "PEN", active: true },
    { id: 1, name: "Standard", maxEstablishments: 1, monthlyPriceAmount: 75, annualPriceAmount: 750, currency: "PEN", active: true },
    { id: 2, name: "Premium", maxEstablishments: -1, monthlyPriceAmount: 190, annualPriceAmount: 1900, currency: "PEN", active: true },
  ],
  EUR: [
    { id: 0, name: "Free", maxEstablishments: 1, monthlyPriceAmount: 0, annualPriceAmount: 0, currency: "EUR", active: true },
    { id: 1, name: "Standard", maxEstablishments: 1, monthlyPriceAmount: 18, annualPriceAmount: 180, currency: "EUR", active: true },
    { id: 2, name: "Premium", maxEstablishments: -1, monthlyPriceAmount: 45, annualPriceAmount: 450, currency: "EUR", active: true },
  ],
} as const;

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("SubscribeView Component", () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === "/api/billing/plans") {
      const currency = (url.searchParams.get("currency") ?? "USD") as keyof typeof plansByCurrency;
      return jsonResponse(plansByCurrency[currency]);
    }

    return jsonResponse({ message: "Not found" }, 404);
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockClear();
    vi.unstubAllGlobals();
  });

  it("renders Free, Standard and Premium when the plans endpoint returns them", async () => {
    render(<SubscribeView />);

    expect(await screen.findByText("Choose the plan that fits you")).toBeDefined();
    expect(await screen.findByRole("button", { name: "Get Free plan" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Get Standard plan" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Get Premium plan" })).toBeDefined();
  });

  it("toggles billing cycle between Monthly and Annual", async () => {
    render(<SubscribeView />);

    expect(await screen.findByText("$20")).toBeDefined();

    fireEvent.click(screen.getByRole("switch", { name: "Toggle annual billing" }));

    await waitFor(() => {
      expect(screen.getByText("$17")).toBeDefined();
    });
  });

  it("switches currency between PEN, USD, and EUR", async () => {
    render(<SubscribeView />);

    expect(await screen.findByText("$20")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /PEN/ }));

    await waitFor(() => {
      expect(screen.getByText("S/.75")).toBeDefined();
    });
  });
});
