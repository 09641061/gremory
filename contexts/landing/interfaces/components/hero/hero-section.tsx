"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { KoduBlinkingIcon } from "@/contexts/shared/interfaces/components/icons/kodu-blinking";
import {
  ArrowRightIcon,
  StarIcon,
  SparklesIcon,
  CheckCircle2Icon,
} from "lucide-react";

export function HeroSection() {
  const { t } = useLandingI18n();
  const hero = t.landing.hero;

  const demoAvatars = [
    { name: "Lucia Romero", initials: "LR", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    { name: "Marco Peña", initials: "MP", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    { name: "Sofia Castro", initials: "SC", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    { name: "Andres Gil", initials: "AG", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
  ];

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-border">
              <SparklesIcon className="size-3 text-primary" />
              <span>{hero.badge}</span>
            </div>

            {/* Headline with crisp solid typography (no gradient text) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.12]">
              {hero.titleStart}
              <span className="text-primary font-extrabold">
                {hero.titleHighlight}
              </span>
              {hero.titleEnd}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-normal">
              {hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
              <Button
                size="lg"
                nativeButton={false}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-6 h-11 shadow-xs"
                render={<Link href="/login" />}
              >
                <span>{hero.primaryCta}</span>
                <ArrowRightIcon className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                className="gap-2 border-border/80 text-foreground hover:bg-muted/50 text-sm font-medium px-6 h-11"
                render={<Link href="#pricing" />}
              >
                <span>{hero.secondaryCta}</span>
              </Button>
            </div>

            {/* Subtext note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
              <span>{hero.freeTrialNote}</span>
            </div>

            {/* Social Proof */}
            <div className="pt-6 border-t border-border/40 w-full flex flex-wrap items-center gap-5">
              <AvatarGroup className="-space-x-2">
                {demoAvatars.map((user, i) => (
                  <Avatar key={i} size="sm" className="ring-2 ring-background">
                    <AvatarImage src={user.img} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="size-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground ml-1">
                    {hero.ratingValue}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {hero.socialProofTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual / Animated Kodu Mascot Display */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-all hover:border-border">
                {/* Mascot Frame */}
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                    <div className="relative z-10 size-44 sm:size-52 flex items-center justify-center">
                      <KoduBlinkingIcon size={190} />
                    </div>
                  </div>

                  <div className="mt-4 text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      Kodu Online
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground max-w-xs">
                      &quot;¡Hola! ¿Qué agendamos hoy para tu negocio?&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
