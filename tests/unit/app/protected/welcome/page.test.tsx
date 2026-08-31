/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WelcomePage from "@/app/(protected)/(app)/welcome/page";

describe("WelcomePage", () => {
  it("renders a minimal welcome fallback", () => {
    render(<WelcomePage />);

    expect(screen.getByRole("heading", { name: "Bienvenido" })).toBeDefined();
    expect(screen.getByText(/Tu espacio ya está listo\./)).toBeDefined();
  });
});
