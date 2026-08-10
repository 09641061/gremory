/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { SubscribeView } from "@/contexts/billing/interfaces/components/subscribe/subscribe-view";
import type {
  PlanReadModel,
  PlansByCurrencyReadModel,
} from "@/contexts/billing/application/internal/queryservices/list-plans-query.service";

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

function plan(
  id: number,
  name: string,
  monthlyPriceAmount: number,
  annualPriceAmount: number,
): PlanReadModel {
  return {
    id,
    name,
    description: `${name} description`,
    monthlyPriceAmount,
    annualPriceAmount,
    features: [`${name} feature`],
    isPopular: false,
  };
}

// The page resolves every currency up front, so the view never fetches.
const plansByCurrency: PlansByCurrencyReadModel = {
  USD: [plan(0, "Free", 0, 0), plan(1, "Standard", 20, 200), plan(2, "Premium", 50, 500)],
  PEN: [plan(0, "Free", 0, 0), plan(1, "Standard", 75, 750), plan(2, "Premium", 190, 1900)],
  EUR: [plan(0, "Free", 0, 0), plan(1, "Standard", 18, 180), plan(2, "Premium", 45, 450)],
};

describe("SubscribeView Component", () => {

  it("renders only the paid plans, dropping the free plan the endpoint returns", async () => {
    render(<SubscribeView backHref="/chat" plansByCurrency={plansByCurrency} />);

    expect(await screen.findByText("Choose the plan that fits you")).toBeDefined();
    expect(await screen.findByRole("button", { name: "Get Standard plan" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Get Premium plan" })).toBeDefined();
    // The catalog still serves the free plan; only the page hides it.
    expect(screen.queryByRole("button", { name: "Get Free plan" })).toBeNull();
    expect(screen.queryByText("Try the core product experience.")).toBeNull();
  });

  it("toggles billing cycle between Monthly and Annual", async () => {
    render(<SubscribeView backHref="/chat" plansByCurrency={plansByCurrency} />);

    expect(await screen.findByText("$20")).toBeDefined();

    fireEvent.click(screen.getByRole("switch", { name: "Toggle annual billing" }));

    await waitFor(() => {
      expect(screen.getByText("$17")).toBeDefined();
    });
  });

  it("switches currency between PEN, USD, and EUR", async () => {
    render(<SubscribeView backHref="/chat" plansByCurrency={plansByCurrency} />);

    expect(await screen.findByText("$20")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /PEN/ }));

    await waitFor(() => {
      expect(screen.getByText("S/.75")).toBeDefined();
    });
  });
});
