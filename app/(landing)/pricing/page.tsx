import type { Metadata } from "next";
import { PricingPageView } from "@/contexts/landing/interfaces/components";

export const metadata: Metadata = {
  title: "Precios y Planes - Takodu",
  description:
    "Conoce nuestros planes Standard y Max. Sin contratos forzosos, configuración en minutos y todas las herramientas de IA para tu negocio.",
};

export default function PricingPage() {
  return <PricingPageView />;
}
