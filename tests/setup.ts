import "@testing-library/jest-dom/vitest";

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
