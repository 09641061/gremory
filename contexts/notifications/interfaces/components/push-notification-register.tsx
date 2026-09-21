"use client";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { useEffect, useRef } from "react";
import { requestPushPermission, registerForegroundNotificationListener } from "@/lib/firebase";
import { registerDeviceTokenAction } from "../actions/notification.actions";

export function PushNotificationRegister({ isAuthenticated }: { isAuthenticated: boolean }) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || registeredRef.current) return;
    registeredRef.current = true;

    requestPushPermission().then(async (token) => {
      if (token) {
        try {
          const res = await registerDeviceTokenAction(token, "WEB");
          if (!res.success) {
            recordSafely("notifications.push.notification.register", { code: "CLIENT_OPERATION_REJECTED" });
          }
        } catch (error) {
          recordSafely("notifications.push.notification.register", { cause: error });
        }
      }
    });

    // Listen for push notifications when the tab is in the foreground
    const unsubscribe = registerForegroundNotificationListener((payload) => {
      recordSafely("notifications.push.notification.register", { code: "FOREGROUND_NOTIFICATION_RECEIVED" });
      const title = payload.notification?.title || payload.data?.title || "Takodu Notification";
      const options = {
        body: payload.notification?.body || payload.data?.message || payload.data?.body || "",
        icon: "/favicon.ico",
      };

      if (Notification.permission === "granted") {
        new Notification(title, options);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [isAuthenticated]);

  return null;
}

