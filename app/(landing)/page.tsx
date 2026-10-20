import type { Metadata } from "next";
import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";
import {
  FaqSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  OwnerSection,
  PricingSection,
} from "@/contexts/landing/interfaces/components";
import { getLandingDictionary } from "@/contexts/landing/interfaces/i18n";

export const metadata: Metadata = {
  title: "Takodu - Tu agenda se llena sola por WhatsApp",
  description:
    "Takodu responde a tus clientes a cualquier hora, agenda sus citas y les recuerda llegar. Agenda, CRM y reportes para barberías, spas y consultorios.",
};

export default async function LandingPage() {
  const dictionary = getLandingDictionary(await getServerLocale());

  return (
    <>
      <HeroSection hero={dictionary.hero} />
      <HowItWorksSection howItWorks={dictionary.howItWorks} />
      <OwnerSection owner={dictionary.owner} />
      <PricingSection pricing={dictionary.pricing} />
      <FaqSection faq={dictionary.faq} />
      <FinalCtaSection finalCta={dictionary.finalCta} />
    </>
  );
}
