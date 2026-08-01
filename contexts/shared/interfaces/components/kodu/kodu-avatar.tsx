"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { KoduBlinkingIcon } from "../icons/kodu-blinking";
import { KoduStaIcon } from "../icons/kodu";
import { useKoduAnimation } from "./use-kodu-animation";

interface KoduAvatarProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    | "children"
    | "className"
    | "type"
    | "onPointerDown"
    | "onPointerUp"
    | "onPointerCancel"
    | "onLostPointerCapture"
    | "onContextMenu"
    | "aria-label"
  > {
  className?: string;
  iconClassName?: string;
  iconSize?: number;
  label?: string;
  variant?: "framed" | "flat";
  idleIcon?: ReactNode;
  pressedIcon?: ReactNode;
}

export function KoduAvatar({
  className,
  iconClassName,
  iconSize = 20,
  label = "Kodu avatar",
  variant = "framed",
  idleIcon,
  pressedIcon,
  ...buttonProps
}: KoduAvatarProps) {
  const {
    isPressed,
    iconStyle,
    handlePointerDown,
    handlePointerEnd,
    handleContextMenu,
  } = useKoduAnimation();

  const idleNode = idleIcon ?? <KoduStaIcon size={iconSize} className={cn("object-contain", iconClassName)} />;
  const pressedNode =
    pressedIcon ?? <KoduBlinkingIcon size={iconSize} className={cn("object-contain", iconClassName)} />;

  return (
    <button
      type="button"
      aria-label={label}
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
      {...buttonProps}
    >
      <span
        className="pointer-events-none flex items-center justify-center transition-transform duration-150 ease-out"
        style={iconStyle}
      >
        <span className={cn(isPressed && "hidden")}>{idleNode}</span>
        <span className={cn(!isPressed && "hidden")}>{pressedNode}</span>
      </span>
    </button>
  );
}

export function AssistantAvatar(props: KoduAvatarProps) {
  return <KoduAvatar {...props} label={props.label ?? "Assistant avatar"} />;
}
