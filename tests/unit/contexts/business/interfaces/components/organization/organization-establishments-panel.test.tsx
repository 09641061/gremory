/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/business/interfaces/actions/establishment.actions", () => ({
  createEstablishmentAction: vi.fn(),
  updateEstablishmentAction: vi.fn(),
  deleteEstablishmentAction: vi.fn(),
}));

import { OrganizationEstablishmentsPanel } from "@/contexts/business/interfaces/components/organization/organizations-page/organization-establishments-panel";

const organizationId = "11111111-1111-4111-8111-111111111111";

const first = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  organizationId,
  name: "LOCALOne",
  photoUrl: null,
  timeZone: "America/Lima",
  ownerAvailableForScheduling: true,
};

const second = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  organizationId,
  name: "LOCALTwo",
  photoUrl: null,
  timeZone: "Etc/GMT+5",
  ownerAvailableForScheduling: true,
};

function mockApi(content: ReadonlyArray<unknown>) {
  return vi.fn((url: string) => {
    if (url.startsWith("/api/business/establishments/organization")) {
      return Promise.resolve(new Response(JSON.stringify({ content }), { status: 200 }));
    }
    return Promise.resolve(new Response("{}", { status: 200 }));
  });
}

describe("OrganizationEstablishmentsPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("hydrates the form with the selected establishment and tags main/branch", async () => {
    vi.stubGlobal("fetch", mockApi([first, second]));

    render(
      <OrganizationEstablishmentsPanel organizationId={organizationId} canUpdate canCreate />,
    );

    // The label lives outside the trigger; the trigger only shows icon + name.
    expect(await screen.findByText("LOCALOne")).toBeVisible();
    expect(screen.getByText("Establishment:")).toBeVisible();

    const select = screen.getByRole("combobox", { name: "Establishment" });
    expect(select).toHaveTextContent("LOCALOne");

    await userEvent.click(select);
    const firstOption = await screen.findByRole("option", { name: /LOCALOne/ });
    const secondOption = screen.getByRole("option", { name: /LOCALTwo/ });
    expect(firstOption).toHaveTextContent("🏬 LOCALOne");
    expect(secondOption).toHaveTextContent("🏬 LOCALTwo");
    expect(firstOption).not.toHaveTextContent("Main");
    expect(secondOption).not.toHaveTextContent("Branch");

    expect(screen.getByText("Time zone")).toBeVisible();
    expect(screen.getByPlaceholderText("Street address...")).toBeVisible();
    expect(screen.getByRole("button", { name: /Delete Establishment/ })).toBeEnabled();
  });

  it("starts the creation flow by clearing the form and showing a read-only selector", async () => {
    vi.stubGlobal("fetch", mockApi([first, second]));

    render(
      <OrganizationEstablishmentsPanel organizationId={organizationId} canUpdate canCreate />,
    );

    await screen.findByDisplayValue("LOCALOne");
    await userEvent.click(screen.getByRole("button", { name: /Create establishment/ }));

    expect(screen.getByText("New Establishment")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Establishment Name" })).toHaveValue("");
  });

  it("disables deletion when there is only one active location", async () => {
    vi.stubGlobal("fetch", mockApi([first]));

    render(
      <OrganizationEstablishmentsPanel organizationId={organizationId} canUpdate canCreate />,
    );

    await screen.findByDisplayValue("LOCALOne");
    expect(screen.getByRole("button", { name: /Delete Establishment/ })).toBeDisabled();
  });

  it("keeps Save disabled until a change is detected", async () => {
    vi.stubGlobal("fetch", mockApi([first, second]));

    render(
      <OrganizationEstablishmentsPanel organizationId={organizationId} canUpdate canCreate />,
    );

    await screen.findByDisplayValue("LOCALOne");
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();

    const nameInput = screen.getByRole("textbox", { name: "Establishment Name" });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Renamed");

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeEnabled();
  });
});
