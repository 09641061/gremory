"use client";

import { LandingNavbar } from "./navbar/landing-navbar";
import { HeroSection } from "./hero/hero-section";
import { FeaturesSection } from "./features/features-section";
import { ProductPreviewSection } from "./product-preview/product-preview-section";
import { PricingSection } from "./pricing/pricing-section";
import { FaqSection } from "./faq/faq-section";
import { FinalCtaSection } from "./cta/final-cta-section";
import { LandingFooter } from "./footer/landing-footer";

export function LandingPageView() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-foreground">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ProductPreviewSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
