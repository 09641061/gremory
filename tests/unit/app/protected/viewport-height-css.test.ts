import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * `--app-page-viewport-height` was originally defined in `app/globals.css`
 * as a `:root` default of `calc(100vh - 6.5rem)`. The variable had no
 * consumer outside the configuration route group — and the configuration
 * layout set its own value (`calc(100vh - 9.5rem)`) via an inline style on
 * its own `<main>`. The `:root` default was therefore dead.
 *
 * The fix removes the `:root` default from `app/globals.css`. The variable
 * is now owned solely by the configuration layout (the single writer),
 * with the four reader files under
 * `contexts/business/interfaces/components/{organization,establishment}/`
 * continuing to consume it via the existing
 * `lg:h-(--app-page-viewport-height)` / `min-h-(--app-page-viewport-height)`
 * Tailwind arbitrary classes (CSS variables inherit, so descendants of the
 * configuration layout's `<main>` keep reading the inline value).
 *
 * This test locks the audit decision in place: the `:root` default must
 * never come back. A future regression that re-adds the variable to
 * `globals.css` (with or without renaming) fails here, so the next person
 * to touch this file is forced to re-evaluate who owns the value.
 */
describe("--app-page-viewport-height audit", () => {
  const cssPath = resolve(process.cwd(), "app/globals.css");
  const css = readFileSync(cssPath, "utf8");

  it("should not declare --app-page-viewport-height on :root in app/globals.css", () => {
    // The variable has been removed from the design-system defaults. The
    // configuration layout owns it now (single writer, inline style on
    // its <main>); the `:root` default was dead because every consumer
    // lives under that layout and CSS variables inherit.
    expect(css, "app/globals.css should not contain --app-page-viewport-height").not.toMatch(
      /--app-page-viewport-height/,
    );
  });

  it("should not redefine the same variable under a renamed alias either", () => {
    // Belt-and-braces: a future regression might try to keep the spirit of
    // the `:root` default by renaming the variable (e.g. `--page-height`,
    // `--app-page-height`, etc.) but that would re-introduce the same
    // dead-default problem. The invariant is that `app/globals.css` owns
    // NO global page-height variable — the configuration layout is the
    // single source of truth.
    expect(
      css,
      "app/globals.css should not define any page-viewport-height alias either",
    ).not.toMatch(/--(?:app-)?page-(?:viewport-)?height/);
  });
});