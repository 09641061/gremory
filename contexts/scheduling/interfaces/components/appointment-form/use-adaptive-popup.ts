"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export type PopupPlacement = "top" | "bottom";

export function useAdaptivePopup(isOpen: boolean, anchorRef: RefObject<HTMLElement | null>) {
  const [placement, setPlacement] = useState<PopupPlacement>("bottom");
  const [maxHeight, setMaxHeight] = useState(256);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      const shouldOpenUp = spaceBelow < 240 && spaceAbove > spaceBelow;

      setPlacement(shouldOpenUp ? "top" : "bottom");
      setMaxHeight(Math.max(160, Math.min(320, shouldOpenUp ? spaceAbove - 16 : spaceBelow - 16)));
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [anchorRef, isOpen]);

  return { placement, maxHeight };
}
