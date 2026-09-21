"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { KoduAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu-avatar";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

export function FinalCtaSection() {
  const { t } = useLandingI18n();
  const cta = t.landing.cta;

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-card p-8 sm:p-14 lg:p-16 text-center shadow-xs">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex justify-center">
              <KoduAvatar iconSize={26} className="size-12 bg-primary/10 border border-primary/20" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {cta.title}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto font-normal">
              {cta.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                nativeButton={false}
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-6 h-11 shadow-xs"
                render={<Link href="/login" />}
              >
                <span>{cta.button}</span>
                <ArrowRightIcon className="size-3.5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                className="w-full sm:w-auto text-foreground hover:bg-muted/50 text-sm font-medium px-5 h-11 border-border/80"
                render={<Link href="#pricing" />}
              >
                <span>{cta.secondary}</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
              <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
              <span>{cta.footnote}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
