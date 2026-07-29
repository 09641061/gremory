"use client";

import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

import type { StaticImageData } from "next/image";

import assistantIcon from "./assets/kodu_assistant_icon.svg";
import deathIcon from "./assets/ghost/kodu_icon_death.svg";
import xplo1 from "./assets/explosion/kodu_icon_xplo1.svg";
import xplo2 from "./assets/explosion/kodu_icon_xplo2.svg";
import xplo3 from "./assets/explosion/kodu_icon_xplo3.svg";
import xplo4 from "./assets/explosion/kodu_icon_xplo4.svg";
import xplo5 from "./assets/explosion/kodu_icon_xplo5.svg";
import xplo6 from "./assets/explosion/kodu_icon_xplo6.svg";
import xplo7 from "./assets/explosion/kodu_icon_xplo7.svg";

const explosionFrames: StaticImageData[] = [xplo1, xplo2, xplo3, xplo4, xplo5, xplo6, xplo7];
const longPressDelayMs = 500;
const shakeDelayMs = 5000;
const ghostDelayMs = 7000;
const shakeStepMs = 80;
const ghostDurationMs = 3400;
const maxFrame = explosionFrames.length;
const shakePattern = [
  { x: 0, y: 0, rotate: 0 },
  { x: -2, y: 1, rotate: -2 },
  { x: 3, y: -1, rotate: 2 },
  { x: -3, y: 0, rotate: -1 },
  { x: 2, y: 2, rotate: 3 },
  { x: -1, y: -2, rotate: -3 },
] as const;

type AvatarMode = "idle" | "growing" | "shaking" | "ghost";

export interface AssistantAvatarAnimationState {
  currentIcon: StaticImageData;
  iconStyle: CSSProperties;
  handlePointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  handlePointerEnd: () => void;
  handleContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function useAssistantAvatarAnimation(): AssistantAvatarAnimationState {
  const [mode, setMode] = useState<AvatarMode>("idle");
  const [frame, setFrame] = useState(0);
  const [shakeStep, setShakeStep] = useState(0);
  const [ghostProgress, setGhostProgress] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const shakeTimeoutRef = useRef<number | null>(null);
  const shakeIntervalRef = useRef<number | null>(null);
  const ghostTimeoutRef = useRef<number | null>(null);
  const ghostAnimationRef = useRef<number | null>(null);

  function clearTimers() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (shakeTimeoutRef.current !== null) {
      window.clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }

    if (shakeIntervalRef.current !== null) {
      window.clearInterval(shakeIntervalRef.current);
      shakeIntervalRef.current = null;
    }

    if (ghostTimeoutRef.current !== null) {
      window.clearTimeout(ghostTimeoutRef.current);
      ghostTimeoutRef.current = null;
    }

    if (ghostAnimationRef.current !== null) {
      window.cancelAnimationFrame(ghostAnimationRef.current);
      ghostAnimationRef.current = null;
    }
  }

  function resetAvatar() {
    clearTimers();
    setMode("idle");
    setFrame(0);
    setShakeStep(0);
    setGhostProgress(0);
  }

  useEffect(() => clearTimers, []);

  function startGhostMode() {
    clearTimers();
    setMode("ghost");
    setFrame(0);
    setShakeStep(0);
    setGhostProgress(0);

    const startTime = window.performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / ghostDurationMs);
      setGhostProgress(progress);

      if (progress < 1) {
        ghostAnimationRef.current = window.requestAnimationFrame(animate);
        return;
      }

      ghostAnimationRef.current = null;
      resetAvatar();
    };

    ghostAnimationRef.current = window.requestAnimationFrame(animate);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;

    clearTimers();
    setMode("growing");
    setFrame(0);
    setShakeStep(0);
    setGhostProgress(0);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore environments where pointer capture is not available.
    }

    timeoutRef.current = window.setTimeout(() => {
      setFrame(1);
      intervalRef.current = window.setInterval(() => {
        setFrame((current) => (current >= maxFrame ? maxFrame : current + 1));
      }, longPressDelayMs);
    }, longPressDelayMs);

    shakeTimeoutRef.current = window.setTimeout(() => {
      setMode("shaking");
      setShakeStep(1);
      shakeIntervalRef.current = window.setInterval(() => {
        setShakeStep((current) => current + 1);
      }, shakeStepMs);
    }, shakeDelayMs);

    ghostTimeoutRef.current = window.setTimeout(() => {
      startGhostMode();
    }, ghostDelayMs);
  }

  function handlePointerEnd() {
    if (mode === "ghost") return;
    resetAvatar();
  }

  const currentIcon =
    mode === "ghost" ? deathIcon : frame === 0 ? assistantIcon : explosionFrames[frame - 1];
  const scale = 1 + frame * 0.28;
  const isShaking = shakeStep > 0;
  const shakeIndex = isShaking ? shakeStep % shakePattern.length : 0;
  const shakeOffset = shakePattern[shakeIndex];
  const ghostTranslateY = -ghostProgress * 280;
  const ghostScale = 1 + ghostProgress * 0.18;
  const ghostOpacity = 1 - ghostProgress;

  const iconStyle =
    mode === "ghost"
      ? {
          transform: `translateY(${ghostTranslateY}px) scale(${ghostScale})`,
          opacity: ghostOpacity,
        }
      : {
          transform: `scale(${scale}) translate(${shakeOffset.x}px, ${shakeOffset.y}px) rotate(${shakeOffset.rotate}deg)`,
        };

  function handleContextMenu(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return {
    currentIcon,
    iconStyle,
    handlePointerDown,
    handlePointerEnd,
    handleContextMenu,
  };
}
