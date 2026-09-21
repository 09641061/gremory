import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

/**
 * Collects every `.ts`/`.tsx` file under `root`, recursively. Test files are
 * excluded; the gate focuses on production code only.
 */
export async function collectFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      if (/\.test\.(ts|tsx)$/.test(entry.name)) continue;
      const st = await stat(path).catch(() => null);
      if (!st || !st.isFile()) continue;
      out.push(path);
    }
  }
  const absolute = ROOT.endsWith(sep) ? `${ROOT}${root}` : `${ROOT}${sep}${root}`;
  await walk(absolute);
  return out.map((p) => relative(ROOT, p));
}

/**
 * Returns the list of `import ... from "..."` statements in `file` whose
 * specifier matches any of the supplied regexes. The output is human-readable:
 * `<line>:<col>: <full import line>`.
 */
export async function findForbiddenImports(
  file: string,
  patterns: ReadonlyArray<RegExp>,
): Promise<string[]> {
  const absolute = join(ROOT, file);
  const text = await readFile(absolute, "utf8").catch(() => "");
  if (!text) return [];
  // Mask comments so that, e.g., `// see contexts/iam/infrastructure` does
  // not produce a false positive. We keep newlines intact so the reported
  // line/column still matches the original source.
  const stripped = text
    .replace(/\/\/[^\r\n]*/g, (value) => " ".repeat(value.length))
    .replace(/\/\*[\s\S]*?\*\//g, (value) => value.replace(/[^\r\n]/g, " "));
  const hits: string[] = [];
  const lines = stripped.split(/\r?\n/);
  lines.forEach((raw, idx) => {
    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (match) {
        hits.push(`${idx + 1}:${(match.index ?? 0) + 1}: ${raw.trim()}`);
        break;
      }
    }
  });
  return hits;
}

/**
 * Returns identifiers from the supplied set that appear in `file` as
 * TypeScript type annotations or constructor references. This is a heuristic
 * that catches `File`, `FormData`, `Blob`, etc. without parsing the file.
 */
export async function findForbiddenPlatformTypes(
  file: string,
  forbidden: ReadonlySet<string>,
): Promise<string[]> {
  const absolute = join(ROOT, file);
  const text = await readFile(absolute, "utf8").catch(() => "");
  if (!text) return [];
  // Mask comments and quoted literals while preserving newlines so an error
  // such as `"photo URL cannot exceed..."` does not look like a platform type.
  const masked = text
    .replace(/\/\/[^\r\n]*/g, (value) => " ".repeat(value.length))
    .replace(/\/\*[\s\S]*?\*\//g, (value) => value.replace(/[^\r\n]/g, " "))
    .replace(/`(?:\\\\.|[^`])*`/g, (value) => value.replace(/[^\r\n]/g, " "))
    .replace(/"(?:\\\\.|[^"\\])*"/g, (value) => value.replace(/[^\r\n]/g, " "))
    .replace(/'(?:\\\\.|[^'\\])*'/g, (value) => value.replace(/[^\r\n]/g, " "));
  const lines = masked.split(/\r?\n/);
  const originalLines = text.split(/\r?\n/);
  const hits: string[] = [];
  lines.forEach((raw, idx) => {
    for (const type of forbidden) {
      // Match identifiers preceded by `:`, `<`, `,`, `(`, `[`, ` `, `=`, `&`, `|`,
      // and followed by a non-identifier boundary. Avoids flagging partial
      // words inside longer identifiers.
      const re = new RegExp(`(?:[:<,(\\[\\s=&|])${type}(?![A-Za-z0-9_])`);
      if (re.test(raw)) {
        hits.push(`${idx + 1}: ${type} (${originalLines[idx]?.trim() ?? ""})`);
        break;
      }
    }
  });
  return hits;
}
