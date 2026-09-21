import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getAnalyticsDictionary,
} from "@/contexts/analytics/interfaces/i18n";

describe("Analytics i18n translations", () => {
  it("should have matching keys between en and es dictionaries", () => {
    function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      const keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          keys.push(...collectKeys(value as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    expect(collectKeys(es)).toEqual(collectKeys(en));
  });

  it("should provide non-empty strings in both locales for all required domains", () => {
    // KPI cards
    expect(en.metrics.grossRevenue).toBe("Gross revenue");
    expect(es.metrics.grossRevenue).toBe("Facturación bruta");
    expect(en.metrics.totalAppointments).toBe("Total appointments");
    expect(es.metrics.totalAppointments).toBe("Citas totales");
    expect(en.metrics.averageTicket).toBe("Average ticket");
    expect(es.metrics.averageTicket).toBe("Ticket promedio");
    expect(en.metrics.completionRate).toBe("Completion rate");
    expect(es.metrics.completionRate).toBe("Tasa de completitud");
    expect(en.metrics.newCustomers).toBe("New customers");
    expect(es.metrics.newCustomers).toBe("Clientes nuevos");

    // Chart labels and tooltips
    expect(en.charts.appointmentTrend).toBe("Appointments Trend");
    expect(es.charts.appointmentTrend).toBe("Tendencia de citas");
    expect(en.charts.tooltips.revenue).toBe("Revenue");
    expect(es.charts.tooltips.revenue).toBe("Ingresos");

    // CSV export headers and file naming
    expect(en.export.downloadCsv).toBe("Download CSV");
    expect(es.export.downloadCsv).toBe("Descargar CSV");
    expect(en.export.filePrefixStandard).toBe("analytics-standard");
    expect(es.export.filePrefixStandard).toBe("analiticas-standard");
    expect(en.export.filePrefixMax).toBe("analytics-max-bi");
    expect(es.export.filePrefixMax).toBe("analiticas-max-bi");
    expect(en.export.csvHeaders.date).toBe("Date");
    expect(es.export.csvHeaders.date).toBe("Fecha");

    // Filter ranges
    expect(en.datePicker.today).toBe("Today");
    expect(es.datePicker.today).toBe("Hoy");
    expect(en.datePicker.last7Days).toBe("Last 7 days");
    expect(es.datePicker.last7Days).toBe("Últimos 7 días");
    expect(en.datePicker.last30Days).toBe("Last 30 days");
    expect(es.datePicker.last30Days).toBe("Últimos 30 días");
    expect(en.datePicker.last90Days).toBe("Last 90 days");
    expect(es.datePicker.last90Days).toBe("Últimos 90 días");
    expect(en.datePicker.customRange).toBe("Custom range");
    expect(es.datePicker.customRange).toBe("Rango personalizado");

    // Empty states and loading indicators
    expect(en.state.emptyTitle).toBe("No data available");
    expect(es.state.emptyTitle).toBe("Sin datos registrados");
    expect(en.state.loading).toBe("Loading analytics...");
    expect(es.state.loading).toBe("Cargando analíticas...");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getAnalyticsDictionary("es")).toBe(es);
    expect(getAnalyticsDictionary("en")).toBe(en);
    expect(getAnalyticsDictionary(null)).toBe(en);
  });
});
