/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PlansView } from "@/contexts/billing/interfaces/components/plans/plans-view";

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


describe("PlansView Component", () => {
  it("renders main title 'Choose your plan'", () => {
    render(<PlansView />);
    expect(screen.getByText("Choose your plan")).toBeDefined();
  });

  it("renders Standard and Premium plan cards", () => {
    render(<PlansView />);
    expect(screen.getByText("Standard")).toBeDefined();
    expect(screen.getByText("Premium")).toBeDefined();
  });

  it("toggles billing cycle between Monthly and Annual", () => {
    render(<PlansView />);
    const toggleButton = screen.getByRole("switch", { name: "Toggle annual billing" });

    // Initially monthly
    expect(screen.getByText(/75\.00/)).toBeDefined();

    // Toggle to annual (750 / 12 = 62.50)
    fireEvent.click(toggleButton);
    expect(screen.getByText(/62\.50/)).toBeDefined();
  });

  it("switches currency between PEN, USD, and EUR", () => {
    render(<PlansView />);
    const usdButton = screen.getByRole("button", { name: /USD/ });

    fireEvent.click(usdButton);
    expect(screen.getByText(/20\.00/)).toBeDefined();
  });
});
