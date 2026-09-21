// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import {
  LandingNavbar,
  HeroSection,
  FeaturesSection,
  ProductPreviewSection,
  PricingSection,
  FaqSection,
  FinalCtaSection,
  LandingFooter,
  LandingPageView,
} from "@/contexts/landing/interfaces/components";

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

  class MockIntersectionObserver {
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

function renderWithI18n(ui: React.ReactElement, locale: "es" | "en" = "es") {
  return render(<I18nProvider initialLocale={locale}>{ui}</I18nProvider>);
}

describe("Landing UI Components", () => {
  it("renders LandingNavbar correctly in Spanish", () => {
    renderWithI18n(<LandingNavbar />, "es");
    expect(screen.getByLabelText("Takodu")).toBeInTheDocument();
    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByText("Comenzar gratis")).toBeInTheDocument();
  });

  it("renders LandingNavbar correctly in English", () => {
    renderWithI18n(<LandingNavbar />, "en");
    expect(screen.getByLabelText("Takodu")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Get Started Free")).toBeInTheDocument();
  });

  it("renders HeroSection with CTA and Kodu mascot", () => {
    renderWithI18n(<HeroSection />, "es");
    expect(screen.getByText("Empieza ahora")).toBeInTheDocument();
    expect(screen.getByText("Ver planes y precios")).toBeInTheDocument();
    expect(screen.getByText("Kodu Online")).toBeInTheDocument();
  });

  it("renders FeaturesSection with 4 feature cards", () => {
    renderWithI18n(<FeaturesSection />, "es");
    expect(screen.getByText("Asistente IA Conversacional (Kodu)")).toBeInTheDocument();
    expect(screen.getByText("Agenda & Reservas Inteligentes")).toBeInTheDocument();
    expect(screen.getByText("CRM & Gestión de Clientes")).toBeInTheDocument();
    expect(screen.getByText("Analíticas & Inteligencia de Negocio")).toBeInTheDocument();
  });

  it("renders ProductPreviewSection with tabs", () => {
    renderWithI18n(<ProductPreviewSection />, "es");
    expect(screen.getByText("Chat con Kodu IA")).toBeInTheDocument();
    expect(screen.getByText("Agenda Inteligente")).toBeInTheDocument();
    expect(screen.getByText("Métricas y Clientes")).toBeInTheDocument();
  });

  it("renders PricingSection with Standard and Max plans", () => {
    renderWithI18n(<PricingSection />, "es");
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("Max")).toBeInTheDocument();
    expect(screen.getByText("Más Popular")).toBeInTheDocument();
    expect(screen.getByText("Comenzar con Standard")).toBeInTheDocument();
    expect(screen.getByText("Obtener Plan Max")).toBeInTheDocument();
  });

  it("renders FaqSection with accordion items", () => {
    renderWithI18n(<FaqSection />, "es");
    expect(screen.getByText("¿Qué es Takodu y cómo me ayuda?")).toBeInTheDocument();
    expect(screen.getByText("¿Kodu puede responder a mis clientes fuera de horario?")).toBeInTheDocument();
  });

  it("renders FinalCtaSection with high-impact CTA", () => {
    renderWithI18n(<FinalCtaSection />, "es");
    expect(screen.getByText("Comenzar prueba gratis")).toBeInTheDocument();
    expect(screen.getByText("Hablar con un asesor")).toBeInTheDocument();
  });

  it("renders LandingFooter with links and copyright", () => {
    renderWithI18n(<LandingFooter />, "es");
    expect(screen.getByText("© 2026 Takodu Inc. Todos los derechos reservados.")).toBeInTheDocument();
    expect(screen.getByText("Sistemas operativos")).toBeInTheDocument();
  });

  it("renders complete LandingPageView without crashing", () => {
    const { container } = renderWithI18n(<LandingPageView />, "es");
    expect(container).toBeInTheDocument();
  });
});
