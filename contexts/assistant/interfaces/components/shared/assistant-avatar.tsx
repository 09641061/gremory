"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

import { useAssistantAvatarAnimation } from "./use-assistant-avatar-animation";

interface AssistantAvatarProps {
  className?: string;
  iconClassName?: string;
  iconSize?: number;
  iconAlt?: string;
}

export function AssistantAvatar({
  className,
  iconClassName,
  iconSize = 20,
  iconAlt = "Assistant avatar",
}: AssistantAvatarProps) {
  const {
    currentIcon,
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
        "flex shrink-0 items-center justify-center overflow-visible rounded-full border border-border/60 bg-background",
        className,
      )}
    >
      <span
        className="pointer-events-none flex items-center justify-center transition-transform duration-150 ease-out"
        style={iconStyle}
      >
        <Image
          src={currentIcon}
          alt=""
          width={iconSize}
          height={iconSize}
          className={cn("object-contain", iconClassName)}
        />
      </span>
    </button>
  );
}
