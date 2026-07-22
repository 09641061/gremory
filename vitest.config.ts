import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const projectRoot = process.cwd();

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
      "server-only": resolve(projectRoot, "tests/mocks/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["tests/setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["contexts/iam/**/*.ts", "contexts/iam/**/*.tsx"],
      exclude: ["**/*.test.*"],
      reporter: ["text", "html"],
    },
  },
});
