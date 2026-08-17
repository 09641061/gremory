/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));

import AccessDeniedPage from "@/app/(protected)/(access-denied)/access-denied/page";

describe("AccessDeniedPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("keeps the permission denied state for a true access denied case", async () => {
    const element = await AccessDeniedPage();
    render(element);

    expect(screen.getByText("You do not have permission to access this section")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
