"use client";

import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import { useEffect, useState } from "react";

import type { StaticImageData } from "next/image";

import assistantIcon from "./assets/kodu_sta_icon.svg";
import blinkingIcon from "./assets/kodu_ani_blinking.svg";

type AvatarMode = "idle" | "pressed";

export interface AssistantAvatarAnimationState {
  currentIcon: StaticImageData;
  iconStyle: CSSProperties;
  handlePointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  handlePointerEnd: () => void;
  handleContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function useAssistantAvatarAnimation(): AssistantAvatarAnimationState {
  const [mode, setMode] = useState<AvatarMode>("idle");

  useEffect(() => () => setMode("idle"), []);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;

    setMode("pressed");

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in every environment.
    }
  }

  function handlePointerEnd() {
    setMode("idle");
  }

  function handleContextMenu(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  const currentIcon = mode === "pressed" ? blinkingIcon : assistantIcon;
  const iconStyle = {
    transform: mode === "pressed" ? "scale(1.04)" : "scale(1)",
    transition: "transform 150ms ease-out",
  };

  return {
    currentIcon,
    iconStyle,
    handlePointerDown,
    handlePointerEnd,
    handleContextMenu,
  };
}
