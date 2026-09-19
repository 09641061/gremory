/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

import { JoinShareableLinkView } from "@/contexts/workforce/interfaces/components/join-shareable-link-view";

describe("JoinShareableLinkView", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("redeems the shareable token through the accept proxy on mount", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<JoinShareableLinkView token="dev-token" organizationName="Takodu Studio" />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/workforce/invitations/shareable-links/accept",
        expect.objectContaining({ method: "POST", body: JSON.stringify({ token: "dev-token" }) }),
      );
    });
    expect(await screen.findByText(/All set/)).toBeVisible();
  });

  it("surfaces the backend message when the link is no longer valid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Invitation has expired" }), { status: 410 }),
      ),
    );

    render(<JoinShareableLinkView token="expired" organizationName="Takodu Studio" />);

    expect(await screen.findByText("Invitation has expired")).toBeVisible();
  });
});
