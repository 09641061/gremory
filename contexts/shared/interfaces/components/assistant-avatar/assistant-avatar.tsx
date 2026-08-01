"use client";

import { cn } from "@/lib/utils";

import { KoduBlinkingIcon } from "../icons/kodu-blinking";
import { KoduStaIcon } from "../icons/kodu";
import { useAssistantAvatarAnimation } from "./use-assistant-avatar-animation";

interface AssistantAvatarProps {
  className?: string;
  iconClassName?: string;
  iconSize?: number;
  iconAlt?: string;
  variant?: "framed" | "flat";
}

export function AssistantAvatar({
  className,
  iconClassName,
  iconSize = 20,
  iconAlt = "Assistant avatar",
  variant = "framed",
}: AssistantAvatarProps) {
  const {
    isPressed,
    iconStyle,
    handlePointerDown,
    handlePointerEnd,
    handleContextMenu,
  } = useAssistantAvatarAnimation();

  return (
    <button
      type="button"
      aria-label={iconAlt}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
      onContextMenu={handleContextMenu}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-visible rounded-full transition-transform duration-150 ease-out",
        variant === "framed" &&
          "border border-border/50 bg-background shadow-[0_6px_16px_rgba(15,23,42,0.05)] hover:-translate-y-0.5",
        variant === "flat" && "border-transparent bg-transparent shadow-none hover:translate-y-0",
        className,
      )}
    >
      <span
        className="pointer-events-none flex items-center justify-center transition-transform duration-150 ease-out"
        style={iconStyle}
      >
        <KoduBlinkingIcon size={iconSize} className={cn("object-contain", iconClassName, !isPressed && "hidden")} />
        <KoduStaIcon size={iconSize} className={cn("object-contain", iconClassName, isPressed && "hidden")} />
      </span>
    </button>
  );
}
