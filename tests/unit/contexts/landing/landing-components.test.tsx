// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { beforeAll, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nProvider } from "@/contexts/shared/interfaces/i18n";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
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
  PricingPageView,
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

describe("Landing UI Components (Bilingual & No Trial Mentions)", () => {
  describe("Spanish Locale", () => {
    it("renders LandingNavbar correctly in Spanish", () => {
      renderWithI18n(<LandingNavbar />, "es");
      expect(screen.getByLabelText("Takodu")).toBeInTheDocument();
      expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
      expect(screen.getByText("Comenzar")).toBeInTheDocument();
    });

    it("renders HeroSection with CTA and Kodu mascot", () => {
      renderWithI18n(<HeroSection />, "es");
      expect(screen.getByText("Comenzar ahora")).toBeInTheDocument();
      expect(screen.getByText("Ver planes y precios")).toBeInTheDocument();
      expect(screen.getByText("Kodu en línea")).toBeInTheDocument();
      expect(screen.queryByText(/14 días/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/prueba gratis/i)).not.toBeInTheDocument();
    });

    it("renders FeaturesSection with 4 feature cards", () => {
      renderWithI18n(<FeaturesSection />, "es");
      expect(screen.getByText("Asistente IA Conversacional (Kodu)")).toBeInTheDocument();
      expect(screen.getByText("Agenda & Reservas Inteligentes")).toBeInTheDocument();
      expect(screen.getByText("CRM & Gestión de Clientes")).toBeInTheDocument();
      expect(screen.getByText("Analíticas & Inteligencia de Negocio")).toBeInTheDocument();
    });

    it("renders ProductPreviewSection with localized badges and tabs", () => {
      renderWithI18n(<ProductPreviewSection />, "es");
      expect(screen.getByText("Chat con Kodu IA")).toBeInTheDocument();
      expect(screen.getByText("Agenda Inteligente")).toBeInTheDocument();
      expect(screen.getByText("Métricas y Clientes")).toBeInTheDocument();
      expect(screen.getByText("IA Activa")).toBeInTheDocument();
    });

    it("renders PricingSection with Standard and Max plans", () => {
      renderWithI18n(<PricingSection />, "es");
      expect(screen.getByText("Standard")).toBeInTheDocument();
      expect(screen.getByText("Max")).toBeInTheDocument();
      expect(screen.getByText("Más Popular")).toBeInTheDocument();
      expect(screen.getByText("Comenzar con Standard")).toBeInTheDocument();
      expect(screen.getByText("Obtener Plan Max")).toBeInTheDocument();
      expect(screen.queryByText(/14 días/i)).not.toBeInTheDocument();
    });

    it("renders FaqSection with accordion items", () => {
      renderWithI18n(<FaqSection />, "es");
      expect(screen.getByText("¿Qué es Takodu y cómo me ayuda?")).toBeInTheDocument();
      expect(screen.getByText("¿Kodu puede responder a mis clientes fuera de horario?")).toBeInTheDocument();
    });

    it("renders FinalCtaSection with high-impact CTA without free trial mention", () => {
      renderWithI18n(<FinalCtaSection />, "es");
      expect(screen.getByText("Comenzar Ahora")).toBeInTheDocument();
      expect(screen.getByText("Hablar con un asesor")).toBeInTheDocument();
      expect(screen.queryByText(/14 días/i)).not.toBeInTheDocument();
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

    it("renders PricingPageView with comparison table and no free trial text", () => {
      renderWithI18n(<PricingPageView />, "es");
      expect(screen.getByText("Compara todas las características")).toBeInTheDocument();
      expect(screen.queryByText(/14 días/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/prueba gratis/i)).not.toBeInTheDocument();
    });
  });

  describe("English Locale (No Spanish Bleed)", () => {
    it("renders LandingNavbar correctly in English", () => {
      renderWithI18n(<LandingNavbar />, "en");
      expect(screen.getByLabelText("Takodu")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("renders HeroSection in English without leftover Spanish text", () => {
      renderWithI18n(<HeroSection />, "en");
      expect(screen.getByText("Get Started")).toBeInTheDocument();
      expect(screen.getByText("View Plans & Pricing")).toBeInTheDocument();
      expect(screen.getByText("Kodu Online")).toBeInTheDocument();
      expect(screen.getByText('"Hi! What can we schedule for your business today?"')).toBeInTheDocument();
      expect(screen.queryByText("Empieza ahora")).not.toBeInTheDocument();
      expect(screen.queryByText("Ver planes y precios")).not.toBeInTheDocument();
      expect(screen.queryByText(/14-day/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/free trial/i)).not.toBeInTheDocument();
    });

    it("renders FeaturesSection in English with translated highlights", () => {
      renderWithI18n(<FeaturesSection />, "en");
      expect(screen.getByText("Conversational AI Assistant (Kodu)")).toBeInTheDocument();
      expect(screen.getByText("Smart Scheduling & Booking")).toBeInTheDocument();
      expect(screen.getByText("CRM & Client Management")).toBeInTheDocument();
      expect(screen.getByText("Analytics & Business Intelligence")).toBeInTheDocument();
      expect(screen.getByText("Natural conversation")).toBeInTheDocument();
      expect(screen.queryByText("Lenguaje natural fluido")).not.toBeInTheDocument();
    });

    it("renders ProductPreviewSection in English", () => {
      renderWithI18n(<ProductPreviewSection />, "en");
      expect(screen.getByText("Chat with Kodu AI")).toBeInTheDocument();
      expect(screen.getByText("Smart Schedule")).toBeInTheDocument();
      expect(screen.getByText("Metrics & Clients")).toBeInTheDocument();
      expect(screen.getByText("AI Active")).toBeInTheDocument();
      expect(screen.queryByText("IA Activa")).not.toBeInTheDocument();
    });

    it("renders PricingSection in English", () => {
      renderWithI18n(<PricingSection />, "en");
      expect(screen.getByText("Standard")).toBeInTheDocument();
      expect(screen.getByText("Max")).toBeInTheDocument();
      expect(screen.getByText("Most Popular")).toBeInTheDocument();
      expect(screen.getByText("Start with Standard")).toBeInTheDocument();
      expect(screen.getByText("Get Max Plan")).toBeInTheDocument();
      expect(screen.queryByText("Más Popular")).not.toBeInTheDocument();
    });

    it("renders PricingPageView in English with updated features and removed SLA section", () => {
      renderWithI18n(<PricingPageView />, "en");
      expect(screen.getByText("Compare all features")).toBeInTheDocument();
      expect(screen.getByText("Capacity & Organization")).toBeInTheDocument();
      expect(screen.getByText("Client directory & records")).toBeInTheDocument();
      expect(screen.queryByText("Support, Security & SLA")).not.toBeInTheDocument();
      expect(screen.queryByText(/whatsapp/i)).not.toBeInTheDocument();
      expect(screen.queryByText("Customer database")).not.toBeInTheDocument();
      expect(screen.queryByText("Capacidad & Organización")).not.toBeInTheDocument();
      expect(screen.queryByText(/14 days/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/free trial/i)).not.toBeInTheDocument();
    });

    it("renders PricingPageView in Spanish with updated features and removed SLA section", () => {
      renderWithI18n(<PricingPageView />, "es");
      expect(screen.getByText("Compara todas las características")).toBeInTheDocument();
      expect(screen.getByText("Capacidad y Organización")).toBeInTheDocument();
      expect(screen.getByText("Directorio de clientes")).toBeInTheDocument();
      expect(screen.queryByText("Soporte, Seguridad y SLA")).not.toBeInTheDocument();
      expect(screen.queryByText("Base de datos de clientes")).not.toBeInTheDocument();
      expect(screen.queryByText(/whatsapp/i)).not.toBeInTheDocument();
      expect(screen.queryByText("Notas personalizadas y preferencias")).not.toBeInTheDocument();
      expect(screen.queryByText("Campañas de reactivación de clientes")).not.toBeInTheDocument();
    });

    it("dynamically toggles language directly when clicking navbar language button", () => {
      render(
        <I18nProvider initialLocale="es">
          <LandingNavbar />
        </I18nProvider>
      );

      const langBtn = screen.getAllByRole("button", { name: /idioma|language/i })[0];
      expect(langBtn).toHaveTextContent(/es/i);

      fireEvent.click(langBtn);

      expect(langBtn).toHaveTextContent(/en/i);
      expect(screen.getByText("Sign In")).toBeInTheDocument();

      fireEvent.click(langBtn);

      expect(langBtn).toHaveTextContent(/es/i);
      expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    });

    it("dynamically changes language from English to Spanish without errors or profile requirement", () => {
      function TestWrapper() {
        const { locale, setLocale, t } = useLandingI18n();
        return (
          <div>
            <span data-testid="current-lang">{locale}</span>
            <span data-testid="cta-text">{t.landing.hero.primaryCta}</span>
            <button onClick={() => setLocale("es")}>Switch to ES</button>
            <button onClick={() => setLocale("en")}>Switch to EN</button>
          </div>
        );
      }

      render(
        <I18nProvider initialLocale="en">
          <TestWrapper />
        </I18nProvider>
      );

      expect(screen.getByTestId("current-lang")).toHaveTextContent("en");
      expect(screen.getByTestId("cta-text")).toHaveTextContent("Get Started");

      fireEvent.click(screen.getByText("Switch to ES"));

      expect(screen.getByTestId("current-lang")).toHaveTextContent("es");
      expect(screen.getByTestId("cta-text")).toHaveTextContent("Comenzar ahora");
      expect(document.cookie).toContain("takodu_locale=es");
    });
  });
});

