import "@testing-library/jest-dom/vitest";

/**
 * Vitest helpers added in newer releases are not guaranteed in the bundled
 * version available in this workspace. Keep the test suite compatible by
 * polyfilling the small subset we rely on.
 */
if (typeof vi !== "undefined") {
  if (typeof vi.hoisted !== "function") {
    vi.hoisted = ((factory: () => unknown) => factory()) as typeof vi.hoisted;
  }

  if (typeof vi.mocked !== "function") {
    vi.mocked = ((value: unknown) => value) as typeof vi.mocked;
  }
}

/**
 * Browser APIs that jsdom does not implement but Base UI's floating primitives
 * (popover, select, dropdown menu) call on open. Without them the popup never
 * mounts and interaction tests silently see an empty portal.
 *
 * Guarded because this setup file also runs for node-environment test files.
 */
if (typeof window !== "undefined") {
  const browser = window as unknown as Record<string, unknown>;

  browser.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  browser.PointerEvent ??= browser.MouseEvent;

  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}
