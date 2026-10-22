import Link from "next/link";
import { DropletIcon, Grid2x2Icon, ScissorsIcon, SparklesIcon } from "lucide-react";
import { KoduMinimalistIcon } from "@/contexts/shared/interfaces/components/icons/kodu-minimalist";
import type { LandingHero } from "@/contexts/landing/interfaces/i18n";
import { WhatsappMockup } from "./whatsapp-mockup";

const VERTICAL_ICONS = [ScissorsIcon, SparklesIcon, DropletIcon, Grid2x2Icon] as const;

export function HeroSection({ hero }: { hero: LandingHero }) {
  const verticals = [
    { label: hero.verticals.barberias, Icon: VERTICAL_ICONS[0] },
    { label: hero.verticals.spas, Icon: VERTICAL_ICONS[1] },
    { label: hero.verticals.nails, Icon: VERTICAL_ICONS[2] },
    { label: hero.verticals.consultorios, Icon: VERTICAL_ICONS[3] },
  ];

  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="space-y-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            <span className="text-primary">
              <KoduMinimalistIcon size={22} />
            </span>
            {hero.eyebrow}
          </p>

          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {hero.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex h-11 items-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
            >
              {hero.secondaryCta}
            </Link>
          </div>
        </div>

        <WhatsappMockup chat={hero.chat} />
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-7 sm:px-6 md:grid-cols-4">
          {verticals.map(({ label, Icon }) => (
            <p
              key={label}
              className="flex items-center gap-2.5 text-sm font-semibold text-foreground"
            >
              <Icon className="size-4 shrink-0 text-primary" />
              {label}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
