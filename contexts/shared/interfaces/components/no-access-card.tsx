"use client";

import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

export function NoAccessCard() {
  const { t } = useI18n();

  return (
    <Card>
      <CardContent className="space-y-4 p-7 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.shared.noAccessTitle}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {t.shared.noAccessDesc1}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {t.shared.noAccessDesc2}
        </p>
      </CardContent>
    </Card>
  );
}
