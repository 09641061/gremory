/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  preview: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/contexts/workforce/interfaces/server/workforce-composition", () => ({
  composeWorkforceAdapters: () => ({
    workforceService: { preview: mocks.preview },
  }),
}));
vi.mock("@/contexts/workforce/interfaces/components/accept-invitation-button", () => ({
  AcceptInvitationButton: () => <button>Aceptar invitación</button>,
}));

import AcceptInvitationPage from "@/app/(auth)/invitations/accept/page";

const preview = {
  organizationId: "11111111-1111-4111-8111-111111111111",
  organizationName: "Takodu",
  establishmentId: "22222222-2222-4222-8222-222222222222",
  establishmentName: "Centro",
  maskedEmail: "p***@example.com",
  recipientRegistered: false,
  expiresAt: "2026-10-27T12:00:00Z",
};

describe("Accept invitation page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.cookies.mockResolvedValue({ get: () => undefined });
    mocks.preview.mockResolvedValue(preview);
  });

  it("asks an unregistered recipient to create an account and preserves the invitation", async () => {
    render(await AcceptInvitationPage({
      searchParams: Promise.resolve({ token: "raw-token" }),
    }));

    const link = screen.getByRole("link", { name: "Crear cuenta para aceptar" });
    expect(link).toHaveAttribute(
      "href",
      "/login?intent=register&next=%2Finvitations%2Faccept%3Ftoken%3Draw-token",
    );
    expect(screen.getByText(/Crea una cuenta con ese correo/)).toBeVisible();
  });

  it("asks an existing recipient to sign in", async () => {
    mocks.preview.mockResolvedValue({ ...preview, recipientRegistered: true });

    render(await AcceptInvitationPage({
      searchParams: Promise.resolve({ token: "raw-token" }),
    }));

    expect(screen.getByRole("link", { name: "Iniciar sesión para aceptar" })).toHaveAttribute(
      "href",
      "/login?next=%2Finvitations%2Faccept%3Ftoken%3Draw-token",
    );
  });
});
