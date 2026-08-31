export type Theme = "LIGHT" | "DARK" | "SYSTEM";

export function createTheme(value: string): Theme {
  const normalized = value.trim().toUpperCase();
  if (normalized === "LIGHT" || normalized === "DARK" || normalized === "SYSTEM") {
    return normalized;
  }
  throw new Error("Theme must be LIGHT, DARK, or SYSTEM");
}
