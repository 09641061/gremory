import type { LandingOwner } from "@/contexts/landing/interfaces/i18n";

export function WeeklySummaryCard({
  reports,
}: {
  reports: LandingOwner["reports"];
}) {
  return (
    <div className="rounded-2xl bg-muted/60 p-6 shadow-xs">
      <p className="text-xs font-bold text-primary">{reports.summaryTitle}</p>
      <p className="mt-3 text-lg font-semibold leading-snug text-foreground">
        {reports.summaryBody}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">{reports.summaryCaption}</p>
    </div>
  );
}
