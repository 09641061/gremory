import type { Metadata } from "next";
import { PricingPageView } from "@/contexts/landing/interfaces/components";

export const metadata: Metadata = {
  title: "Precios y Planes - Takodu",
  description:
    "Conoce nuestros planes Standard y Max. Sin contratos a largo plazo, 14 días de prueba gratis y todas las herramientas de IA para tu negocio.",
};

export default function PricingPage() {
  return <PricingPageView />;
}
