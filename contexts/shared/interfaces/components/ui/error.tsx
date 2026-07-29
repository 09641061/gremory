"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CircleAlertIcon, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./alert";

export function ErrorAlert({
  title,
  message,
  onDismiss,
}: {
  title: string;
  message?: string;
  onDismiss?: () => void;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) {
      setDismissedMessage(null);
      return;
    }
    if (message === dismissedMessage) return;

    setProgress(100);
    const startTime = Date.now();
    const duration = 4000;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 40);

    const timeout = window.setTimeout(() => {
      setDismissedMessage(message);
      if (onDismiss) onDismiss();
    }, duration);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [message, dismissedMessage, onDismiss]);

  if (
    !mounted ||
    typeof document === "undefined" ||
    !message ||
    message === dismissedMessage
  ) {
    return null;
  }

  const handleDismiss = () => {
    setDismissedMessage(message);
    if (onDismiss) onDismiss();
  };

  return createPortal(
    <Alert
      variant="destructive"
      className={cn(
        "!fixed !right-4 !top-4 !z-[9999] w-[calc(100%-2rem)] max-w-sm overflow-hidden",
        "flex flex-col gap-1 rounded-xl border border-destructive/20 bg-background/95 p-4 shadow-xl backdrop-blur-md",
        "animate-in fade-in slide-in-from-top-2 md:slide-in-from-right-2 duration-300",
        "pr-10"
      )}
    >
      <div className="flex gap-3 items-start">
        <CircleAlertIcon className="text-destructive size-5 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <AlertTitle className="text-sm font-semibold text-foreground leading-none">{title}</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground leading-normal mt-1">
            {message}
          </AlertDescription>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <X className="size-3.5" />
      </button>

      {/* Progress timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
        <div 
          className="h-full bg-destructive transition-all ease-linear duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Alert>,
    document.body
  );
}
