/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CancelSubscriptionModal } from "@/contexts/billing/interfaces/components/cancel/cancel-subscription-modal";

const mocks = vi.hoisted(() => ({
  cancelSubscriptionAction: vi.fn(),
}));

vi.mock("@/contexts/billing/interfaces/actions/cancel-subscription.action", () => ({
  cancelSubscriptionAction: mocks.cancelSubscriptionAction,
}));

describe("CancelSubscriptionModal Component", () => {
  it("renders with plan name and description details", () => {
    const handleClose = vi.fn();
    const handleCancelled = vi.fn();

    render(
      <CancelSubscriptionModal
        isOpen={true}
        onClose={handleClose}
        planName="Standard"
        onCancelled={handleCancelled}
      />
    );

    expect(screen.getByText(/Cancel Subscription/)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel your/)).toBeInTheDocument();
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText(/You will retain access to your premium features/)).toBeInTheDocument();
  });

  it("calls cancelSubscriptionAction when confirm button is clicked", async () => {
    mocks.cancelSubscriptionAction.mockResolvedValue({ status: "success", error: null });
    const handleClose = vi.fn();
    const handleCancelled = vi.fn();

    render(
      <CancelSubscriptionModal
        isOpen={true}
        onClose={handleClose}
        planName="Standard"
        onCancelled={handleCancelled}
      />
    );

    const confirmButton = screen.getByRole("button", { name: "Cancel subscription" });
    
    // Usar act para envolver la confirmación y la transición
    await React.act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(mocks.cancelSubscriptionAction).toHaveBeenCalled();
  });
});
