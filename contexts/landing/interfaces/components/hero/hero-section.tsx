"use client";

import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { StatusBadge } from "@/contexts/shared/interfaces/components/ui/status-badge";
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
  CalendarIcon,
  BotIcon,
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
      className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32"
    >
      {/* Background radial glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 h-[500px] w-[800px] max-w-full rounded-full bg-primary/15 blur-[120px] dark:bg-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-20 -z-10 size-72 rounded-full bg-accent/30 blur-[100px] dark:bg-accent/15"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2">
              <StatusBadge tone="success" className="px-3 py-1 text-xs gap-1.5 shadow-xs">
                <SparklesIcon className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>{hero.badge}</span>
              </StatusBadge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {hero.titleStart}
              <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                {hero.titleHighlight}
              </span>
              {hero.titleEnd}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl font-normal">
              {hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md text-base px-6 h-12"
                render={<Link href="/login" />}
              >
                <span>{hero.primaryCta}</span>
                <ArrowRightIcon className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border/80 text-foreground hover:bg-muted/70 text-base px-6 h-12"
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
            <div className="pt-6 border-t border-border/60 w-full flex flex-wrap items-center gap-6">
              <AvatarGroup className="-space-x-2.5">
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

          {/* Right Hero Visual / Animated Kodu Mascot Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Outer decorative card frame */}
              <div className="relative rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-6 sm:p-8 shadow-xl backdrop-blur-xs">
                
                {/* Floating pill 1: 24/7 AI */}
                <div className="absolute -top-4 -left-4 z-20 flex items-center gap-2 rounded-full border border-border/70 bg-background/95 px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-md">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <BotIcon className="size-3.5" />
                  </div>
                  <span className="text-foreground">Kodu AI 24/7</span>
                </div>

                {/* Floating pill 2: Real-time Schedule */}
                <div className="absolute -bottom-4 -right-2 z-20 flex items-center gap-2 rounded-full border border-border/70 bg-background/95 px-3.5 py-1.5 text-xs font-semibold shadow-md backdrop-blur-md">
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CalendarIcon className="size-3.5" />
                  </div>
                  <span className="text-foreground">100% Sincronizado</span>
                </div>

                {/* Animated Kodu Centerpiece */}
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                    {/* Mascot halo */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-colors" />
                    
                    {/* Animated Kodu SVG */}
                    <div className="relative z-10 size-48 sm:size-56 flex items-center justify-center">
                      <KoduBlinkingIcon size={200} className="drop-shadow-lg" />
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      <span className="size-2 rounded-full bg-primary animate-pulse" />
                      Kodu Online
                    </div>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
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
