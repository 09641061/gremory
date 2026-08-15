import type { AnalyticsCategoryPoint, AnalyticsTrendPoint } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTrendRange(start?: string, end?: string) {
  if (!start || !end) return "Last 7 days";
  return `${formatTrendDate(start)} - ${formatTrendDate(end)}`;
}

export function formatTrendDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTrendDateLabel(value?: string) {
  if (!value) return "N/A";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTrendTick(value: number, valueFormatter?: (value: number) => string) {
  const normalized = Number.isFinite(value) ? value : 0;
  return valueFormatter ? valueFormatter(normalized) : formatNumber(Math.round(normalized));
}

export function findPeakTrendPoint(data: AnalyticsTrendPoint[]) {
  if (data.length === 0) {
    return {
      label: "N/A",
      value: 0,
    };
  }

  const peakPoint = data.reduce((best, current) => (current.value >= best.value ? current : best), data[0]);

  return {
    label: formatTrendDateLabel(peakPoint.date),
    value: peakPoint.value,
  };
}

export function findPeakCategoryPoint(data: AnalyticsCategoryPoint[]) {
  if (data.length === 0) {
    return {
      label: "N/A",
      value: 0,
    };
  }

  const peakPoint = data.reduce((best, current) => (current.value >= best.value ? current : best), data[0]);

  return {
    label: peakPoint.label,
    value: peakPoint.value,
  };
}

export function buildTrendPoints(values: number[]) {
  if (values.length === 0) return [];

  const maxValue = Math.max(...values, 1);
  const left = 6;
  const right = 96;
  const top = 8;
  const bottom = 52;
  return values.map((value, index) => ({
    x: values.length === 1 ? (left + right) / 2 : left + (index / (values.length - 1)) * (right - left),
    y: bottom - (value / maxValue) * (bottom - top),
  }));
}

export function buildPolyline(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

export function buildArea(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "M 0 52 L 100 52 L 100 52 L 0 52 Z";

  const first = points[0];
  const last = points[points.length - 1];
  const line = points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" L ");
  return `M ${first.x.toFixed(2)} 52 L ${line} L ${last.x.toFixed(2)} 52 Z`;
}

export function buildYAxisTicks(maxValue: number) {
  const ceiling = Math.max(1, Math.ceil(maxValue));
  const step = Math.max(1, Math.ceil(ceiling / 3));
  const values = [ceiling, Math.max(0, ceiling - step), Math.max(0, ceiling - step * 2), 0];

  const uniqueValues = values.filter((value, index) => values.indexOf(value) === index);
  const positions = [8, 22, 36, 50];

  return uniqueValues.map((value, index) => ({
    value,
    y: positions[index] ?? positions[positions.length - 1],
  }));
}
