/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";

import { ComparisonTrendChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/comparison-trend-chart";

describe("ComparisonTrendChart", () => {
  it("renders the selected series and accessible daily points", () => {
    render(
      <ComparisonTrendChart
        series={[
          { label: "Completed", tone: "text-success", data: [{ date: "2026-08-01", value: 4 }] },
          { label: "Cancelled", tone: "text-destructive", data: [{ date: "2026-08-01", value: 1 }] },
        ]}
      />,
    );

    expect(screen.getByText("Completed")).toBeVisible();
    expect(screen.getByText("Cancelled")).toBeVisible();
    expect(screen.getByRole("img", { name: /Completed/ })).toBeVisible();
    expect(screen.getByRole("img", { name: /Cancelled/ })).toBeVisible();
  });
});
