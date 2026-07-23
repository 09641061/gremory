import React from "react";
import { PlansView } from "@/contexts/billing/interfaces/components/plans/plans-view";

export const metadata = {
  title: "Takodu | Plans & Pricing",
  description: "Choose your subscription plan to scale your billing infrastructure with Takodu.",
};

export default function PlansPage() {
  return <PlansView />;
}
