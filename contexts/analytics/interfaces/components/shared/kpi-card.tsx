"use client";

import React from "react";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  growthPercentage?: number;
  highlightVariant?: "default" | "destructive" | "success" | "warning";
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  growthPercentage,
  highlightVariant = "default",
}: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all hover:border-border hover:shadow-xs">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {Icon && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              <Icon className="size-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </span>
          {growthPercentage !== undefined && (
            <Badge
              variant={
                growthPercentage > 0
                  ? "secondary"
                  : growthPercentage < 0
                  ? "destructive"
                  : "outline"
              }
              className="flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-semibold"
            >
              {growthPercentage > 0 ? (
                <TrendingUp className="size-3 text-emerald-500" />
              ) : growthPercentage < 0 ? (
                <TrendingDown className="size-3 text-rose-500" />
              ) : (
                <Minus className="size-3 text-muted-foreground" />
              )}
              {growthPercentage > 0 ? "+" : ""}
              {growthPercentage.toFixed(1)}%
            </Badge>
          )}
        </div>

        {subtitle && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
