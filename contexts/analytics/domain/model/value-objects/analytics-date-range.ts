export type AnalyticsPreset = "today" | "7d" | "30d" | "90d" | "custom";

export class AnalyticsDateRange {
  constructor(
    public readonly from: string,
    public readonly to: string
  ) {
    if (new Date(from) > new Date(to)) {
      throw new Error("The 'from' date must be before or equal to the 'to' date.");
    }
  }

  static create(from: string, to: string): AnalyticsDateRange {
    return new AnalyticsDateRange(from, to);
  }

  static fromPreset(preset: AnalyticsPreset, maxDays: number = 30): AnalyticsDateRange {
    const today = new Date();
    const to = today.toISOString().split("T")[0];
    const fromDate = new Date(today);

    switch (preset) {
      case "today":
        break;
      case "7d":
        fromDate.setDate(today.getDate() - 6);
        break;
      case "30d":
        fromDate.setDate(today.getDate() - 29);
        break;
      case "90d":
        fromDate.setDate(today.getDate() - (Math.min(90, maxDays) - 1));
        break;
      default:
        fromDate.setDate(today.getDate() - (maxDays - 1));
        break;
    }

    const from = fromDate.toISOString().split("T")[0];
    return new AnalyticsDateRange(from, to);
  }
}
