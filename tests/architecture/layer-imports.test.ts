import { describe, expect, it } from "vitest";

import {
  collectFiles,
  findForbiddenImports,
  findForbiddenPlatformTypes,
} from "./layer-import-rules";

/**
 * Architecture gate (Phase 6 of the DDD refactor plan).
 *
 *   - Application MUST NOT import from `Infrastructure`, `Interfaces`,
 *     `next/*`, `react`, `react-dom`, `zod`, `fs`, `node:*` (filesystem
 *     primitives), `cookies`, `server-only`, or platform IO (`File`,
 *     `FormData`, `Blob`, `URL`, `Headers`, `Request`, `Response`).
 *
 *   - Domain MUST NOT import from `Application`, `Infrastructure`,
 *     `Interfaces`, or any of the platform types above.
 *
 *   - Domain MAY import from `zod` only when a runtime contract is the
 *     source of truth for an invariant Domain protects. This rule is
 *     enforced via an opt-in directory: `domain/contracts/`. Anything
 *     else under `domain/` is forbidden from touching Zod.
 *
 * The gate runs in CI; failures here mean the codebase drifted and the
 * corresponding refactor must catch up.
 */

const ARCHITECTURE_ROOTS = [
  "contexts/iam",
  "contexts/profiles",
  "contexts/business",
  "contexts/catalog",
  "contexts/crm",
  "contexts/scheduling",
  "contexts/billing",
  "contexts/notifications",
  "contexts/analytics",
  "contexts/assistant",
] as const;

const APPLICATION_LAYER = ARCHITECTURE_ROOTS.map((root) => `${root}/application`);
const DOMAIN_LAYER = ARCHITECTURE_ROOTS.map((root) => `${root}/domain`);

const FORBIDDEN_FROM_APPLICATION = [
  // Relative and aliased imports that cross outward from the layer. We match
  // the path inside the import specifier rather than walking from `from`/
  // `import` so that quoted-string syntax is handled uniformly.
  /["'][^"']*\/infrastructure\//,
  /["'][^"']*\/interfaces\//,
  // Platform/framework imports and side-effect imports.
  /["'][^"']*next\//,
  /["']react(?:-dom)?["']/,
  /["']zod["']/,
  /["']server-only["']/,
  /["'](?:node:)?(?:fs|path|url|stream)(?:\/|["'])/,
];

const FORBIDDEN_FROM_DOMAIN = [
  ...FORBIDDEN_FROM_APPLICATION,
  /["'][^"']*\/application\//,
];

const FORBIDDEN_PLATFORM_TYPES = new Set([
  "File",
  "FormData",
  "Blob",
  "URL",
  "URLSearchParams",
  "Headers",
  "Request",
  "Response",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
]);

describe("architecture layer imports", () => {
  it("Application never imports outward into Infrastructure/Interfaces/Next/React/Zod/IO", async () => {
    const offenders = new Map<string, string[]>();
    for (const layer of APPLICATION_LAYER) {
      const files = await collectFiles(layer);
      for (const file of files) {
        const hits = await findForbiddenImports(file, FORBIDDEN_FROM_APPLICATION);
        if (hits.length > 0) offenders.set(file, hits);
      }
    }
    if (offenders.size > 0) {
      const lines = [...offenders.entries()]
        .map(([file, hits]) => `  ${file}\n    - ${hits.join("\n    - ")}`)
        .join("\n");
      throw new Error(`Application layer has forbidden imports:\n${lines}`);
    }
    expect(offenders.size).toBe(0);
  });

  it("Domain never imports outward into Application/Infrastructure/Interfaces or platform types", async () => {
    const offenders = new Map<string, string[]>();
    for (const layer of DOMAIN_LAYER) {
      const files = await collectFiles(layer);
      for (const file of files) {
        const hits = await findForbiddenImports(file, FORBIDDEN_FROM_DOMAIN);
        if (hits.length > 0) offenders.set(file, hits);
      }
    }
    if (offenders.size > 0) {
      const lines = [...offenders.entries()]
        .map(([file, hits]) => `  ${file}\n    - ${hits.join("\n    - ")}`)
        .join("\n");
      throw new Error(`Domain layer has forbidden imports:\n${lines}`);
    }
    expect(offenders.size).toBe(0);
  });

  it("Domain does not use Web/Node platform IO types (File/FormData/Blob/URL/Headers/Request/Response)", async () => {
    const offenders = new Map<string, string[]>();
    for (const layer of DOMAIN_LAYER) {
      const files = await collectFiles(layer);
      for (const file of files) {
        const hits = await findForbiddenPlatformTypes(file, FORBIDDEN_PLATFORM_TYPES);
        if (hits.length > 0) offenders.set(file, hits);
      }
    }
    if (offenders.size > 0) {
      const lines = [...offenders.entries()]
        .map(([file, hits]) => `  ${file}\n    - ${hits.join("\n    - ")}`)
        .join("\n");
      throw new Error(`Domain uses forbidden platform types:\n${lines}`);
    }
    expect(offenders.size).toBe(0);
  });
});
