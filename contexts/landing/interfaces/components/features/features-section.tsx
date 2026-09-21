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
import { InfoBadge } from "@/contexts/shared/interfaces/components/ui/info-badge";
import {
  BotIcon,
  CalendarDaysIcon,
  UsersIcon,
  TrendingUpIcon,
  MessageSquareCheckIcon,
  ClockIcon,
  UserCheckIcon,
  BarChart3Icon,
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
      subIcon: MessageSquareCheckIcon,
      gradient: "from-emerald-500/10 via-primary/5 to-transparent",
      iconColor: "text-primary bg-primary/10 border-primary/20",
      highlights: ["Lenguaje natural fluido", "Atención 24/7 sin pausas", "Integración multicanal"],
    },
    {
      id: "scheduling",
      badge: f.items.scheduling.badge,
      title: f.items.scheduling.title,
      description: f.items.scheduling.description,
      icon: CalendarDaysIcon,
      subIcon: ClockIcon,
      gradient: "from-blue-500/10 via-sky-500/5 to-transparent",
      iconColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
      highlights: ["Control de solapamientos", "Vista por profesional/sede", "Recordatorios automáticos"],
    },
    {
      id: "crm",
      badge: f.items.crm.badge,
      title: f.items.crm.title,
      description: f.items.crm.description,
      icon: UsersIcon,
      subIcon: UserCheckIcon,
      gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
      iconColor: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
      highlights: ["Fichas y preferencias", "Historial de servicios", "Campañas de fidelización"],
    },
    {
      id: "analytics",
      badge: f.items.analytics.badge,
      title: f.items.analytics.title,
      description: f.items.analytics.description,
      icon: TrendingUpIcon,
      subIcon: BarChart3Icon,
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      iconColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      highlights: ["Ingresos en tiempo real", "Tasa de ocupación", "Rendimiento del equipo"],
    },
  ];

  return (
    <section
      id="features"
      className="relative py-20 lg:py-28 bg-muted/30 border-y border-border/50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <InfoBadge className="mx-auto uppercase tracking-wider text-[10px]">
            {f.tag}
          </InfoBadge>
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
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/80 bg-card/80 backdrop-blur-xs"
              >
                {/* Subtle top corner gradient */}
                <div
                  className={`pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-gradient-to-br ${item.gradient} blur-2xl group-hover:scale-125 transition-transform duration-500`}
                />

                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl border ${item.iconColor} transition-transform group-hover:scale-110 duration-200`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {item.badge}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-bold text-foreground">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="pt-4 border-t border-border/50 flex flex-wrap gap-2">
                    {item.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground/80"
                      >
                        <span className="size-1.5 rounded-full bg-primary" />
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
