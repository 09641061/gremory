/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/iam/interfaces/actions/request-email-sign-in.action", () => ({
  requestEmailSignInAction: vi.fn(),
}));
vi.mock("@/contexts/iam/interfaces/actions/start-google-auth.action", () => ({
  startGoogleAuthAction: vi.fn(),
}));

import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { InvitationAcceptAuthView } from "@/contexts/workforce/interfaces/components/invitation-accept-auth-view";

function renderView() {
  return render(
    <I18nProvider initialLocale="en">
      <InvitationAcceptAuthView
        organizationName="Takodu Studio"
        invitedEmail="invited@example.com"
        returnTo="/invitations/accept?token=raw-token"
      />
    </I18nProvider>,
  );
}

describe("InvitationAcceptAuthView", () => {
  it("greets the invitee with the organization name and the invitation CTA", () => {
    renderView();

    expect(
      screen.getByRole("heading", {
        name: "Hi! You have been invited to join the organization Takodu Studio on Takodu.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Sign up and accept invitation" }),
    ).toBeVisible();
  });

  it("locks the email field to the invited address", () => {
    const { container } = renderView();

    const email = screen.getByRole("textbox", { name: "Email address" });
    expect(email).toHaveValue("invited@example.com");
    expect(email).toBeDisabled();
    expect(container.querySelector('input[type="hidden"][name="email"]')).toHaveValue(
      "invited@example.com",
    );
  });

  it("hides the Google option so the invited identity cannot diverge", () => {
    renderView();

    expect(screen.queryByRole("button", { name: /Google/ })).toBeNull();
  });
});
