"use client";

import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import {
  BotIcon,
  CalendarDaysIcon,
  UsersIcon,
  TrendingUpIcon,
  CheckIcon,
} from "lucide-react";

export function FeaturesSection() {
  const { t } = useLandingI18n();
  const f = t.landing.features;

  const featureCards = [
    {
      id: "ai",
      badge: f.items.ai.badge,
      title: f.items.ai.title,
      description: f.items.ai.description,
      icon: BotIcon,
      highlights: f.items.ai.highlights,
    },
    {
      id: "scheduling",
      badge: f.items.scheduling.badge,
      title: f.items.scheduling.title,
      description: f.items.scheduling.description,
      icon: CalendarDaysIcon,
      highlights: f.items.scheduling.highlights,
    },
    {
      id: "crm",
      badge: f.items.crm.badge,
      title: f.items.crm.title,
      description: f.items.crm.description,
      icon: UsersIcon,
      highlights: f.items.crm.highlights,
    },
    {
      id: "analytics",
      badge: f.items.analytics.badge,
      title: f.items.analytics.title,
      description: f.items.analytics.description,
      icon: TrendingUpIcon,
      highlights: f.items.analytics.highlights,
    },
  ];

  return (
    <section
      id="features"
      className="relative py-16 lg:py-24 bg-muted/20 border-y border-border/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {f.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {f.description}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featureCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="relative overflow-hidden transition-all duration-200 border-border/60 bg-card hover:border-border shadow-xs"
              >
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="secondary" className="font-medium text-xs">
                      {item.badge}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-bold text-foreground">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="pt-4 border-t border-border/40 flex flex-wrap gap-2">
                    {item.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground/80"
                      >
                        <CheckIcon className="size-3 text-primary shrink-0" />
                        {highlight}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
