import type { Metadata } from "next";
import {
  HeroSection,
  FeaturesSection,
  ProductPreviewSection,
  PricingSection,
  FaqSection,
  FinalCtaSection,
} from "@/contexts/landing/interfaces/components";

export const metadata: Metadata = {
  title: "Takodu - Plataforma inteligente con Asistente IA para tu negocio",
  description:
    "Centraliza citas, gestiona clientes con CRM y automatiza tu operación 24/7 con el Asistente IA Kodu.",
};

export default function LandingHomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ProductPreviewSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
