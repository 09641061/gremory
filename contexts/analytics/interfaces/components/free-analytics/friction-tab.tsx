import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import { AnalyticsSection } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { RankingList, RateRankingRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/ranking-list";

interface FrictionTabProps {
  analytics: FreeAnalyticsDashboard;
}

export function FrictionTab({ analytics }: FrictionTabProps) {
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
    </AnalyticsSection>
  );
}
