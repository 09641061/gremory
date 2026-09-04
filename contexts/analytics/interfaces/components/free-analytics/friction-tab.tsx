"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import type { StandardAnalyticsDashboard } from "@/contexts/analytics/domain/model/standard-analytics-dashboard";
import { AnalyticsSection } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { RankingList, RankingRow, RateRankingRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/ranking-list";
import { useAnalyticsTranslations } from "@/contexts/analytics/interfaces/i18n";

interface FrictionTabProps {
  analytics: FreeAnalyticsDashboard;
  standardAnalytics?: StandardAnalyticsDashboard;
}

export function FrictionTab({ analytics, standardAnalytics }: FrictionTabProps) {
  const { t } = useAnalyticsTranslations();

  return (
    <AnalyticsSection id="friction">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.friction.cancellationRateByService}</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={analytics.cancellationRateByService}
              emptyLabel={t.friction.noCancellationRankings}
              renderItem={(item) => (
                <RateRankingRow
                  rank={item.rank}
                  label={item.serviceName}
                  rate={item.rate}
                  affectedCount={item.affectedCount}
                  appointmentsCount={item.appointmentsCount}
                  suffix={t.friction.cancelledSuffix}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.friction.noShowRateByService}</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={analytics.noShowRateByService}
              emptyLabel={t.friction.noNoShowRankings}
              renderItem={(item) => (
                <RateRankingRow
                  rank={item.rank}
                  label={item.serviceName}
                  rate={item.rate}
                  affectedCount={item.affectedCount}
                  appointmentsCount={item.appointmentsCount}
                  suffix={t.friction.noShowsSuffix}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>
      {standardAnalytics ? (
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.friction.cancellationReasons}</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">{t.friction.cancellationReasonsSubtitle}</p>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={standardAnalytics.cancellationReasons}
              emptyLabel={t.friction.noCancellationReasons}
              renderItem={(item) => (
                <RankingRow
                  rank={item.rank}
                  label={item.reason}
                  value={item.cancellationsCount}
                  meta={t.friction.cancellationsPercentage.replace("{rate}", String(Math.round(item.rate * 100)))}
                  valueLabel={t.friction.cancellationsLabel}
                />
              )}
            />
          </CardContent>
        </Card>
      ) : null}
    </AnalyticsSection>
  );
}
