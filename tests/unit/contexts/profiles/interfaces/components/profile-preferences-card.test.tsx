/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/contexts/profiles/interfaces/actions/update-preferences.action", () => ({
  updatePreferencesAction: vi.fn(),
}));

import { ProfilePreferencesCard } from "@/contexts/profiles/interfaces/components/profile/profile-preferences-card";

const profile = { language: "ES" as const, theme: "LIGHT" as const };

describe("ProfilePreferencesCard", () => {
  it("should render language and theme choices without a SYSTEM option", () => {
    render(<ProfilePreferencesCard profile={profile} />);

    expect(screen.getByText("Preferences")).toBeVisible();
    expect(screen.getByLabelText("Language")).toHaveValue("ES");
    expect(screen.getByRole("option", { name: "Es" })).toBeVisible();
    expect(screen.getByRole("option", { name: "En" })).toBeVisible();
    expect(screen.getByLabelText("Theme")).toHaveValue("LIGHT");
    expect(screen.getByRole("option", { name: "Light" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Dark" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "SYSTEM" })).not.toBeInTheDocument();
  });

  it("should enable save and cancel when a preference changes", async () => {
    const user = userEvent.setup();
    render(<ProfilePreferencesCard profile={profile} />);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("Language"), "EN");
    await user.selectOptions(screen.getByLabelText("Theme"), "DARK");

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });
});
