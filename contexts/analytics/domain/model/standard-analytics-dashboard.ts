import type { FreeAnalyticsDashboard } from "./free-analytics-dashboard";

export interface StandardAnalyticsDashboard extends FreeAnalyticsDashboard {
  from: string;
  to: string;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionVsCancellationTrend: Array<{ date: string; completed: number; cancelled: number }>;
  leadTimeTrend: Array<{ date: string; value: number }>;
}
