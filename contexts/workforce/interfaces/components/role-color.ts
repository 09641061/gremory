import type { CSSProperties } from "react";

/** Fallback color used when a role has no stored color. */
export const DEFAULT_ROLE_COLOR = "#0EA5E9";

/** Curated, theme-friendly palette for role badges (Discord-style swatches). */
export const ROLE_COLOR_PRESETS = [
  "#10B981",
  "#22C55E",
  "#84CC16",
  "#14B8A6",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#64748B",
  "#6B7280",
] as const;

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function isRoleColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

/** Soft, tinted badge style derived from the stored hex color (undefined = default tokens). */
export function roleBadgeStyle(color?: string | null): CSSProperties | undefined {
  if (!isRoleColor(color)) return undefined;
  return {
    backgroundColor: `${color}1F`,
    color,
    borderColor: `${color}59`,
  };
}
