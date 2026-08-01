export type Language = "ES" | "EN";

export function createLanguage(value: string): Language {
  const normalized = value.trim().toUpperCase();
  if (normalized === "ES" || normalized === "EN") {
    return normalized;
  }
  throw new Error("Language must be ES or EN");
}
