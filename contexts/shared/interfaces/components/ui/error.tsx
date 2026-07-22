"use client";

import { useEffect, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import { createPortal } from "react-dom";
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
      className="!fixed !right-4 !top-4 !z-[9999] w-[calc(100%-2rem)] max-w-sm text-left shadow-lg"
    >
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>,
    document.body
  );
}
