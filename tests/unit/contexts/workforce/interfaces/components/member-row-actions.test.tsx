/** @vitest-environment jsdom */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deactivate: vi.fn(),
}));

vi.mock("@/contexts/workforce/interfaces/actions/workforce.actions", () => ({
  deactivateWorkforceMemberAction: mocks.deactivate,
}));

import { MemberRowActions } from "@/contexts/workforce/interfaces/components/member-row-actions";

describe("MemberRowActions", () => {
  beforeEach(() => {
    mocks.deactivate.mockReset();
  });

  it("confirms and deactivates the selected collaborator", async () => {
    const user = userEvent.setup();
    mocks.deactivate.mockResolvedValue({ success: true, error: null });
    render(
      <MemberRowActions
        organizationId="11111111-1111-4111-8111-111111111111"
        membershipId="22222222-2222-4222-8222-222222222222"
        email="persona@example.com"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dar de baja" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("persona@example.com");
    expect(dialog).toHaveTextContent("citas futuras");
    await user.click(within(dialog).getByRole("button", { name: "Dar de baja" }));

    await waitFor(() => expect(mocks.deactivate).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ));
  });

  it("keeps the dialog available when future appointments block the deactivation", async () => {
    const user = userEvent.setup();
    mocks.deactivate.mockResolvedValue({
      success: false,
      error: "Reasigna sus citas futuras antes de darlo de baja.",
    });
    render(
      <MemberRowActions
        organizationId="11111111-1111-4111-8111-111111111111"
        membershipId="22222222-2222-4222-8222-222222222222"
        email="persona@example.com"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dar de baja" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Dar de baja" }));

    expect(await screen.findByRole("dialog")).toBeVisible();
    expect(await screen.findByRole("alert")).toHaveTextContent("Reasigna sus citas futuras");
  });
});
