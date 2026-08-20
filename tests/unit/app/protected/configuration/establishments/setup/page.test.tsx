import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  workspace: {
    getHeaderViewModel: vi.fn(),
  },
  redirect: vi.fn(),
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.workspace,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import EstablishmentSetupPage from "@/app/(protected)/(app)/establishments/setup/page";

async function renderFullyResolved(element: ReactElement): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = "";
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
    });
    const { pipe } = renderToPipeableStream(element, {
      onAllReady() {
        pipe(writable);
        writable.on("finish", () => resolve(html));
      },
      onError(error) {
        reject(error);
      },
    });
  });
}

describe("EstablishmentSetupPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("touches no dynamic API before entering its own Suspense boundary", () => {
    // The outer component must stay synchronous: awaiting searchParams (or
    // anything else) before the Suspense boundary would make the whole
    // route dynamic and block prerendering (blocking-prerender-dynamic).
    expect(
      EstablishmentSetupPage({ searchParams: Promise.resolve({}) }),
    ).toBeDefined();
    expect(mocks.workspace.getHeaderViewModel).not.toHaveBeenCalled();
  });

  it("shows the onboarding guidance for a ready organization without establishments", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "OWNER",
      organization: {
        id: "org-1",
        name: "Acme",
        imageUrl: null,
      },
      establishments: [],
      canCreateEstablishment: true,
    });

    const markup = await renderFullyResolved(
      EstablishmentSetupPage({ searchParams: Promise.resolve({ organizationId: "org-1" }) }),
    );

    expect(mocks.workspace.getHeaderViewModel).toHaveBeenCalled();
    expect(markup).toContain("Set up your first establishment");
    expect(markup).toContain("/establishments/new?organizationId=org-1");
  });

  it("redirects to organizations when the organization already has establishments", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue({
      accountType: "OWNER",
      organization: { id: "org-1", name: "Acme", imageUrl: null },
      establishments: [{ id: "est-1", organizationId: "org-1" }],
      canCreateEstablishment: true,
    });

    await renderFullyResolved(
      EstablishmentSetupPage({ searchParams: Promise.resolve({ organizationId: "org-1" }) }),
    );

    expect(mocks.redirect).toHaveBeenCalledWith("/organizations");
  });
});
