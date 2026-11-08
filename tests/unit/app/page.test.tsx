// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

vi.mock("@/contexts/shared/infrastructure/i18n/server", () => ({
  getServerLocale: vi.fn(async () => "es"),
}));

import LandingPage from "@/app/(landing)/page";

describe("Landing page", () => {
  it("renders every landing section", async () => {
    const element = await LandingPage();
    render(element);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tu agenda se llena sola por WhatsApp.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Listo en una tarde, sin cambiar cómo trabajas.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Paga por el tamaño de tu negocio.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Lo que más nos preguntan.",
      }),
    ).toBeInTheDocument();
  });
});
