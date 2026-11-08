"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAnalyticsI18n } from "../../i18n";

export function AnalyticsPlanGate() {
  const { t } = useAnalyticsI18n();

  return (
    <Card className="mt-8 border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-transparent">
      <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground">
              {t.banners.upgradeTitle}
            </h4>
            <p className="text-sm text-muted-foreground max-w-xl">
              {t.banners.upgradeDescription}
            </p>
          </div>
        </div>
        <Button nativeButton={false} render={<Link href="/upgrade" />} className="shrink-0 gap-1.5 font-medium shadow-xs">
          {t.banners.upgradeButton}
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
