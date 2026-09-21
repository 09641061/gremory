"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { StatusBadge } from "@/contexts/shared/interfaces/components/ui/status-badge";
import { KoduAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu-avatar";
import { ArrowRightIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";

export function FinalCtaSection() {
  const { t } = useLandingI18n();
  const cta = t.landing.cta;

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 p-8 sm:p-14 lg:p-20 shadow-2xl overflow-hidden text-center">
          
          {/* Background blurred glow elements */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10"
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center">
              <KoduAvatar iconSize={28} className="size-14 bg-primary/15 border border-primary/30 shadow-md" />
            </div>

            <div className="inline-flex items-center gap-2">
              <StatusBadge tone="success" className="px-3 py-1 text-xs gap-1.5 shadow-xs">
                <SparklesIcon className="size-3 text-emerald-600" />
                <span>{cta.badge}</span>
              </StatusBadge>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {cta.title}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {cta.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                render={<Link href="/login" />}
              >
                <span>{cta.button}</span>
                <ArrowRightIcon className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-foreground hover:bg-muted/60 text-base font-medium px-6 h-12 border-border/80"
                render={<Link href="#pricing" />}
              >
                <span>{cta.secondary}</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
              <span>{cta.footnote}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
