export type Theme = "LIGHT" | "DARK";

export function createTheme(value: string): Theme {
  const normalized = value.trim().toUpperCase();
  if (normalized === "LIGHT" || normalized === "DARK") {
    return normalized;
  }
  throw new Error("Theme must be LIGHT or DARK");
}
