import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import { AnalyticsSection } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { RankingList, RankingRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/ranking-list";

interface RankingsTabProps {
  analytics: FreeAnalyticsDashboard;
}

export function RankingsTab({ analytics }: RankingsTabProps) {
  return (
    <AnalyticsSection id="rankings">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Top services</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={analytics.topServices}
              emptyLabel="No service rankings available."
              renderItem={(item) => (
                <RankingRow
                  rank={item.rank}
                  label={item.serviceName}
                  value={item.appointmentsCount}
                  meta={`${item.completedAppointmentsCount} completed / ${item.cancelledAppointmentsCount} cancelled`}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Top customers</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={analytics.topCustomers}
              emptyLabel="No customer rankings available."
              renderItem={(item) => (
                <RankingRow
                  rank={item.rank}
                  label={item.customerName}
                  value={item.appointmentsCount}
                  meta={`${item.completedAppointmentsCount} completed / ${item.cancelledAppointmentsCount} cancelled`}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>
    </AnalyticsSection>
  );
}
