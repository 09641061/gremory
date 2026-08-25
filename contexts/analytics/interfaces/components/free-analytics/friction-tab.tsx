import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import type { StandardAnalyticsDashboard } from "@/contexts/analytics/domain/model/standard-analytics-dashboard";
import { AnalyticsSection } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { RankingList, RankingRow, RateRankingRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/ranking-list";

interface FrictionTabProps {
  analytics: FreeAnalyticsDashboard;
  standardAnalytics?: StandardAnalyticsDashboard;
}

export function FrictionTab({ analytics, standardAnalytics }: FrictionTabProps) {
  return (
    <AnalyticsSection id="friction">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Cancellation rate by service</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={analytics.cancellationRateByService}
              emptyLabel="No cancellation rate rankings available."
              renderItem={(item) => (
                <RateRankingRow
                  rank={item.rank}
                  label={item.serviceName}
                  rate={item.rate}
                  affectedCount={item.affectedCount}
                  appointmentsCount={item.appointmentsCount}
                  suffix="cancelled"
                />
              )}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>No-show rate by service</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={analytics.noShowRateByService}
              emptyLabel="No no-show rate rankings available."
              renderItem={(item) => (
                <RateRankingRow
                  rank={item.rank}
                  label={item.serviceName}
                  rate={item.rate}
                  affectedCount={item.affectedCount}
                  appointmentsCount={item.appointmentsCount}
                  suffix="no shows"
                />
              )}
            />
          </CardContent>
        </Card>
      </div>
      {standardAnalytics ? (
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Cancellation reasons</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">Most frequent reasons in the selected period.</p>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={standardAnalytics.cancellationReasons}
              emptyLabel="No cancellation reasons available."
              renderItem={(item) => (
                <RankingRow
                  rank={item.rank}
                  label={item.reason}
                  value={item.cancellationsCount}
                  meta={`${Math.round(item.rate * 100)}% of cancellations`}
                  valueLabel="Cancellations"
                />
              )}
            />
          </CardContent>
        </Card>
      ) : null}
    </AnalyticsSection>
  );
}
