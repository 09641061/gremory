import { describe, expect, it } from "vitest";

import {
  DEFAULT_ROLE_COLOR,
  isRoleColor,
  roleBadgeStyle,
} from "@/contexts/workforce/interfaces/components/role-color";

describe("role color utilities", () => {
  it("builds a tinted badge style from a valid hex color", () => {
    expect(roleBadgeStyle("#8B5CF6")).toEqual({
      backgroundColor: "#8B5CF61F",
      color: "#8B5CF6",
      borderColor: "#8B5CF659",
    });
  });

  it("falls back to undefined for missing or invalid colors", () => {
    expect(roleBadgeStyle(null)).toBeUndefined();
    expect(roleBadgeStyle(undefined)).toBeUndefined();
    expect(roleBadgeStyle("Sky")).toBeUndefined();
  });

  it("validates hex colors", () => {
    expect(isRoleColor(DEFAULT_ROLE_COLOR)).toBe(true);
    expect(isRoleColor("blue")).toBe(false);
  });
});
