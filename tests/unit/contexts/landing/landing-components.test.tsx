// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FaqAccordion,
  FaqSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  OwnerSection,
  PricingSection,
} from "@/contexts/landing/interfaces/components";
import { getLandingDictionary } from "@/contexts/landing/interfaces/i18n";

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

const es = getLandingDictionary("es");
const en = getLandingDictionary("en");

describe("Landing sections", () => {
  it("renders the hero with its calls to action", () => {
    render(<HeroSection hero={es.hero} />);

    expect(
      screen.getByRole("heading", { level: 1, name: es.hero.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(es.hero.description)).toBeInTheDocument();
    expect(screen.getAllByText(es.hero.primaryCta).length).toBeGreaterThan(0);
    expect(screen.getByText(es.hero.secondaryCta)).toBeInTheDocument();
  });

  it("renders the three how-it-works steps", () => {
    render(<HowItWorksSection howItWorks={es.howItWorks} />);

    for (const step of es.howItWorks.steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    }
  });

  it("renders the owner blocks", () => {
    render(<OwnerSection owner={es.owner} />);

    expect(screen.getByText(es.owner.agenda.title)).toBeInTheDocument();
    expect(screen.getByText(es.owner.reminders.title)).toBeInTheDocument();
    expect(screen.getByText(es.owner.reports.title)).toBeInTheDocument();
    expect(screen.getByText(es.owner.reminders.resendAll)).toBeInTheDocument();
  });

  it("renders the three pricing plans with the featured one highlighted", () => {
    render(<PricingSection pricing={es.pricing} />);

    expect(screen.getByText(es.pricing.plans.inicial.price)).toBeInTheDocument();
    expect(screen.getByText(es.pricing.plans.negocio.price)).toBeInTheDocument();
    expect(screen.getByText(es.pricing.plans.multisede.price)).toBeInTheDocument();
    expect(screen.getByText(es.pricing.plans.negocio.badge)).toBeInTheDocument();
  });

  it("renders the final call to action", () => {
    render(<FinalCtaSection finalCta={es.finalCta} />);

    expect(
      screen.getByRole("heading", { level: 2, name: es.finalCta.title }),
    ).toBeInTheDocument();
  });

  it("renders the english copy", () => {
    render(<HeroSection hero={en.hero} />);

    expect(
      screen.getByRole("heading", { level: 1, name: en.hero.title }),
    ).toBeInTheDocument();
  });
});

describe("Landing FAQ accordion", () => {
  it("opens the first question and expands another one on click", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={es.faq.items} />);

    const firstTrigger = screen.getByRole("button", {
      name: es.faq.items[0]!.question,
    });
    const secondTrigger = screen.getByRole("button", {
      name: es.faq.items[1]!.question,
    });

    expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
    expect(secondTrigger).toHaveAttribute("aria-expanded", "false");

    await user.click(secondTrigger);
    expect(secondTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(es.faq.items[1]!.answer)).toBeInTheDocument();
  });

  it("renders the FAQ section heading", () => {
    render(<FaqSection faq={es.faq} />);

    expect(
      screen.getByRole("heading", { level: 2, name: es.faq.title }),
    ).toBeInTheDocument();
  });
});
