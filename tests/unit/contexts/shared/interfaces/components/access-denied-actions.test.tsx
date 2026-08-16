/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

import { AccessDeniedActions } from "@/contexts/shared/interfaces/components/access-denied-actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("AccessDeniedActions", () => {
  it("offers a direct path to the organizations hub", () => {
    render(<AccessDeniedActions />);

    expect(screen.getByRole("link", { name: /manage organizations/i })).toHaveAttribute(
      "href",
      "/organizations",
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
  });
});
