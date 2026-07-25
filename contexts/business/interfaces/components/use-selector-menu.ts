import { useEffect } from "react";
import type { RefObject } from "react";

/** Shared close-on-outside-click and Escape behavior for business selectors. */
export function useSelectorMenu(
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  selectorRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsidePointer, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, selectorRef, setIsOpen]);
}
