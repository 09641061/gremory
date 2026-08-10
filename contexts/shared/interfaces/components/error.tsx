"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CircleAlertIcon, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";

export function ErrorAlert({
  title,
  message,
  onDismiss,
  resetKey,
}: {
  title: string;
  message?: string;
  onDismiss?: () => void;
  resetKey?: string | number;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [dismissedAlert, setDismissedAlert] = useState<{
    message: string;
    resetKey?: string | number;
  } | null>(null);

  useEffect(() => {
    if (!message) {
      const resetId = window.setTimeout(() => {
        setDismissedAlert(null);
      }, 0);

      return () => {
        window.clearTimeout(resetId);
      };
    }

    if (
      dismissedAlert?.message === message &&
      dismissedAlert.resetKey === resetKey
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDismissedAlert({ message, resetKey });
      onDismiss?.();
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [message, dismissedAlert, resetKey, onDismiss]);

  if (
    !mounted ||
    typeof document === "undefined" ||
    !message ||
    (dismissedAlert?.message === message &&
      dismissedAlert.resetKey === resetKey)
  ) {
    return null;
  }

  const handleDismiss = () => {
    setDismissedAlert({ message, resetKey });
    onDismiss?.();
  };

  return createPortal(
    <ErrorToast
      key={message}
      title={title}
      message={message}
      onDismiss={handleDismiss}
    />,
    document.body,
  );
}

function ErrorToast({
  title,
  message,
  onDismiss,
}: {
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 40);

    const timeout = window.setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [onDismiss]);

  return (
    <Alert
      variant="destructive"
      className={cn(
        "!fixed !right-4 !top-4 !z-[9999] w-[calc(100%-2rem)] max-w-sm overflow-hidden",
        "flex flex-col gap-1 rounded-xl border border-destructive/20 bg-background/95 p-4 shadow-xl backdrop-blur-md",
        "animate-in fade-in slide-in-from-top-2 duration-300 md:slide-in-from-right-2",
        "pr-10",
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <CircleAlertIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="flex flex-col gap-0.5">
          <AlertTitle className="text-sm font-semibold leading-none text-foreground">
            {title}
          </AlertTitle>
          <AlertDescription className="!mt-1 text-xs leading-normal !text-muted-foreground">
            {message}
          </AlertDescription>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Dismiss alert"
      >
        <X className="size-3.5" />
      </button>

      <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-muted">
        <div
          className="h-full bg-destructive transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Alert>
  );
}
