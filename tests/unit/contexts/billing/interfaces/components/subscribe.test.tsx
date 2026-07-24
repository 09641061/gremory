/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SubscribeView } from "@/contexts/billing/interfaces/components/subscribe/subscribe-view";

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

describe("SubscribeView Component", () => {
  it("renders main title 'Choose the plan that fits you'", () => {
    render(<SubscribeView />);
    expect(screen.getByText("Choose the plan that fits you")).toBeDefined();
  });

  it("renders Standard and Premium button labels", () => {
    render(<SubscribeView />);
    expect(screen.getByRole("button", { name: "Get Standard plan" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Get Premium plan" })).toBeDefined();
  });

  it("toggles billing cycle between Monthly and Annual", () => {
    render(<SubscribeView />);
    const toggleButton = screen.getByRole("switch", { name: "Toggle annual billing" });

    // Initially monthly
    expect(screen.getByText(/\$20/)).toBeDefined();

    // Toggle to annual (200 / 12 = 17)
    fireEvent.click(toggleButton);
    expect(screen.getByText(/\$17/)).toBeDefined();
  });

  it("switches currency between PEN, USD, and EUR", () => {
    render(<SubscribeView />);
    const penButton = screen.getByRole("button", { name: /PEN/ });

    fireEvent.click(penButton);
    expect(screen.getByText(/75/)).toBeDefined();
  });
});
