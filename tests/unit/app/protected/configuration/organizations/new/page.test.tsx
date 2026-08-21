import type { ReactElement } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
  workspace: { getHeaderViewModel: vi.fn() },
  createForm: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/contexts/business/application/internal/queryservices/business-workspace-query.service", () => ({
  createBusinessWorkspaceQueryService: () => mocks.workspace,
}));

vi.mock("@/contexts/business/interfaces/components/organization/create-organization/create-organization-form", () => ({
  CreateOrganizationForm: (props: unknown) => {
    mocks.createForm(props);
    return null;
  },
}));

import NewOrganizationPage from "@/app/(protected)/(configuration)/organizations/new/page";

function renderFullyResolved(element: ReactElement): Promise<string> {
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

function baseWorkspace(overrides: Record<string, unknown> = {}) {
  return {
    accountType: "OWNER",
    onboardingStatus: "ORGANIZATION_PENDING",
    onboardingCompleted: false,
    canCreateOrganization: true,
    establishments: [],
    organization: undefined,
    ...overrides,
  };
}

describe("NewOrganizationPage guard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("hides New organization link when the account already owns an organization, by redirecting away", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue(
      baseWorkspace({ canCreateOrganization: false }),
    );

    await expect(renderFullyResolved(NewOrganizationPage())).rejects.toThrow(
      "REDIRECT:/",
    );
  });

  it("renders the create form for an account that owns no organization yet", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue(
      baseWorkspace({ canCreateOrganization: true }),
    );

    await renderFullyResolved(NewOrganizationPage());

    expect(mocks.createForm).toHaveBeenCalledWith(
      expect.objectContaining({ showCancel: expect.any(Boolean) }),
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects a pending invitation to accept it first", async () => {
    mocks.workspace.getHeaderViewModel.mockResolvedValue(
      baseWorkspace({ accountType: "PENDING_INVITATION", canCreateOrganization: true }),
    );

    await expect(
      renderFullyResolved(NewOrganizationPage()),
    ).rejects.toThrow("REDIRECT:/invitations/pending");
  });
});
