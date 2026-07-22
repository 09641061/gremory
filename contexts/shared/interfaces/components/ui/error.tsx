"use client";

import { useEffect, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
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
}: {
  title: string;
  message?: string;
}) {
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message || message === dismissedMessage) return;

    const timeout = window.setTimeout(() => {
      setDismissedMessage(message);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [message, dismissedMessage]);

  if (
    typeof document === "undefined" ||
    !message ||
    message === dismissedMessage
  ) {
    return null;
  }

  return createPortal(
    <Alert
      variant="destructive"
      className={cn(
        "!fixed !right-4 !top-4 !z-[9999] w-[calc(100%-2rem)] max-w-sm",
        "gap-2 rounded-lg border-border bg-card p-4",
        "text-left text-card-foreground shadow-md"
      )}
    >
      <CircleAlertIcon className="text-muted-foreground" />
      <AlertTitle className="text-sm leading-5">{title}</AlertTitle>
      <AlertDescription className="leading-5 text-muted-foreground">
        {message}
      </AlertDescription>
    </Alert>,
    document.body
  );
}
